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
				return handler.get();
			},
			set(replacementValue: unknown) {
				const invocationThis = this;
				if (invocationThis !== receiver) {
					throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
				}
				return handler.set(replacementValue);
			}
		}
	};

	return obj;
}, {});

const createProperty = (propName: string, initialValue: unknown, receiver: object) => {

	const value = initialValue;
	const valueIsPrimitive = isPrimitive(initialValue);
	const isObject = typeof initialValue === 'object';
	const isFunction = initialValue instanceof Function;
	const isNull = initialValue === null;

	const type = valueIsPrimitive ? 'primitives' : (
		isObject ? (
			isNull ? 'nullish' : 'objects'
		) : (
			isFunction ? 'functions' : 'special'));

	// @ts-ignore
	const descriptor = resolver[type](value, receiver);

	const result = Reflect.defineProperty(receiver, propName, {
		...descriptor,
		enumerable: true
	});

	return result;
};


const handlers = {
	get(target: object, prop: string | symbol, receiver: object) {
		const result = Reflect.get(target, prop, receiver);
		if (result !== undefined) {
			return result;
		}
		if (prop === 'toJSON') {
			return function (this: typeof target) {
				return JSON.stringify(Object.entries(this).reduce((obj, [key, value]) => {
					// @ts-ignore
					obj[key] = value.valueOf();
					return obj;
				}, {}));
			}
		}
		throw new Error(`${ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ]`);
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

// const BasePrototype = new Proxy(BaseTarget, handlers);

export interface IDEF<T, P = {}, R = {}> {
	new(...args: unknown[]): T;
	(this: T, ...args: unknown[]): R;
	prototype: P;
};

// @ts-ignore
const BaseConstructor = function (this: object, InstanceTarget = BaseTarget) {
	if (!new.target) {
		const constructor = BaseConstructor.bind(this, InstanceTarget);
		constructor.prototype = {
			constructor: BaseConstructor
		};
		return constructor;
	}

	const InstancePrototype = new Proxy(InstanceTarget, handlers);

	let protoPointer = this;
	let protoConstrcutor;
	do {
		protoPointer = Reflect.getPrototypeOf(protoPointer) as object;
		protoConstrcutor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor')!.value;
	} while (protoConstrcutor !== BaseConstructor);
	Reflect.setPrototypeOf(protoPointer, InstancePrototype);

} as ObjectConstructor;
// } as IDEF;

// Reflect.setPrototypeOf(BaseConstructor.prototype, BasePrototype);

Object.defineProperty(module, 'exports', {
	get() {
		return BaseConstructor;
	},
	enumerable: true
});

// @ts-ignore
export class BaseClass extends BaseConstructor { };

Object.defineProperty(module.exports, 'BaseClass', {
	get() {
		return BaseClass;
	},
	enumerable: true
});
