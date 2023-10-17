'use strict';

import { ErrorsNames } from './errors';

import {
	functions,
	nullish,
	objects,
	primitives,
	special,
	isPrimitive
} from './types';

import { FieldConstructor } from './fields';

const resolver = Object.entries({
	primitives,
	special,
	nullish,
	objects,
	functions
}).reduce((obj: object, [key, _handler]) => {
	// @ts-ignore
	obj[key] = function (initialValue: object, receiver: object) {
		const handler = _handler(initialValue);
		return {
			get() {
				const invocationThis = this;
				if (invocationThis !== receiver) {
					throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
				}
				const result = handler.get();
				return result;
			},
			set(replacementValue: unknown) {
				const invocationThis = this;
				if (invocationThis !== receiver) {
					throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
				}
				const result = handler.set(replacementValue);
				return result;
			}
		};
	};

	return obj;
}, {});

const createProperty = (propName: string, initialValue: unknown, receiver: object) => {

	const value = initialValue;
	const valueIsPrimitive = isPrimitive(initialValue);
	const isObject = typeof initialValue === 'object';
	const isFunction = initialValue instanceof Function;
	const isNull = initialValue === null;

	/**
	 * special: undefined or BigInt or Symbol
	 * 	or other non constructible type
	 */

	const type = valueIsPrimitive ? 'primitives' : (
		isObject ? (
			isNull ? 'nullish' : 'objects'
		) : (
			isFunction ? 'functions' : 'special'
		)
	);

	const descriptor = (isObject && (value instanceof FieldConstructor)) ?
		value
		:
		{
			enumerable: true,
			// @ts-ignore
			...resolver[type](value, receiver),
		};

	// if (value instanceof FieldConstructor) {
	// 	descriptor;
	// 	debugger;
	// }

	const result = Reflect.defineProperty(receiver, propName, descriptor);
	return result;

};

const props2skip = new Set([Symbol.toStringTag, Symbol.iterator]);
const util = require('util');
const hasNodeInspect = (util && util.inspect && util.inspect.custom);
hasNodeInspect && (props2skip.add(util.inspect.custom));

const handlers = {
	get(target: object, prop: string | symbol, receiver: object) {
		const result = Reflect.get(target, prop, receiver);
		if (result !== undefined) {
			return result;
		}
		if (prop === 'toJSON') {
			// eslint-disable-next-line no-unused-vars
			return function (this: typeof target) {
				const entries = Object.entries(this);
				return JSON.stringify(entries.reduce((obj, [key, value]) => {
					// @ts-ignore
					obj[key] = value.valueOf();
					return obj;
				}, {}));
			};
		}
		// @ts-ignore
		if (props2skip.has(prop)) {
			return undefined;
		}
		throw new Error(`${ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] of ${receiver.constructor.name}`);
	},
	set(_: object, prop: string, value: unknown, receiver: object) {
		const result = createProperty(prop, value, receiver);
		return result;
	},
	// defineProperty(target: object, key: string, descriptor: object) {
	// 	Reflect.defineProperty(target, key, descriptor);
	// 	return true;
	// }
};

// user have to precisely define all props
const BaseTarget = Object.create(null);

type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;


export const BaseConstructorPrototype = function <
	P extends object,
	S extends Proto<T, P>,
	T extends {
		(): P
		new (): {
			[key in keyof S]: S[key]
		}
	},
>(
	this: T,
	InstanceTarget: P = BaseTarget
): T {
	if (!new.target) {

		const self: {
			prototype: {
				constructor: typeof BaseConstructorPrototype
			}
		} = BaseConstructorPrototype.bind(this, InstanceTarget);

		self.prototype = {
			constructor: BaseConstructorPrototype
		};

		return self as T;

	}

	const InstancePrototype = new Proxy(InstanceTarget, handlers);

	let protoPointer = this as object;
	let protoConstrcutor;
	do {
		protoPointer = Reflect.getPrototypeOf(protoPointer) as object;
		protoConstrcutor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor')!.value;
	} while (protoConstrcutor !== BaseConstructorPrototype);

	Reflect.setPrototypeOf(protoPointer, InstancePrototype);
	return this;

};

// as ObjectConstructor & {
// 	(): void
// 	// eslint-disable-next-line no-unused-vars
// 	new<T>(param?: T extends object ? T : {}): {
// 		[key in keyof T]: T[key]
// 	}
// };

Object.defineProperty(module, 'exports', {
	get() {
		return BaseConstructorPrototype;
	},
	enumerable: true
});


// eslint-disable-next-line new-cap
// @ts-ignore
export class BaseClass extends BaseConstructorPrototype { }
export { FieldConstructor } from './fields';

Object.defineProperty(module.exports, 'BaseClass', {
	get() {
		return BaseClass;
	},
	enumerable: true
});
Object.defineProperty(module.exports, 'FieldConstructor', {
	get() {
		return FieldConstructor;
	},
	enumerable: true
});
