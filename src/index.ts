// oxlint-disable typescript/no-this-alias
/* eslint-disable no-debugger */
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

// line below 'href' is for util.inspect works, useful for v24
const props2skip = new Set([
	Symbol.toStringTag,
	Symbol.iterator,
	// Symbol.toPrimitive,
	'toString',
	'valueOf',
	'href'
]);
// const props2skip = new Set([Symbol.toStringTag, Symbol.iterator]);
const util = require('util');
const hasNodeInspect = (util && util.inspect && util.inspect.custom);
// oxlint-disable-next-line no-unused-expressions
(hasNodeInspect && (props2skip.add(util.inspect.custom)));

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
		const { name } = receiver.constructor;
		if (props2skip.has(prop)) {
			const message = `${name} lacks definition of [ ${String(prop).valueOf()} ]`;
			return message;
		}
		const errorMessage = `${ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] for ${name}`;
		throw new Error(errorMessage);
	},
	set(_: object, prop: string, value: unknown, receiver: object) {
		const result = createProperty(prop, value, receiver);
		return result;
	},
	// defineProperty(target: object, key: string, descriptor: object) {
	defineProperty() {
		// debugger;
		throw new Error('defineProperty is not allowed');
		// Reflect.defineProperty(target, key, descriptor);
	},
	// getPrototypeOf() {
	// 	debugger;
	// 	throw new Error('Getting prototype is not allowed');
	// },
	setPrototypeOf() {
		// debugger;
		throw new Error('Setting prototype is not allowed');
	},
};

Object.freeze(handlers);

type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;

// user have to precisely define all props
const baseTarget = (proto: object | null = null) => {
	const answer = Object.create(proto);
	// debugger;
	return answer;
};

export const SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target: object) => {
	const target = Object.create(_target);
	const id = `TypeØmaticaProxyReference-${Math.random()}`;
	Object.defineProperty(target, SymbolTypeomaticaProxyReference, {
		get() {
			return id;
		}
	});
	const proxy = new Proxy(target, handlers);
	return proxy;
};


export const BaseConstructorPrototype = function <
	P extends object,
	S extends Proto<T, P>,
	T extends {
		(): P
		new(): {
			[key in keyof S]: S[key]
		}
	},
>(
	this: T,
	_target: P | null = null
): T {
	if (!new.target) {

		const self: {
			prototype: {
				constructor: typeof BaseConstructorPrototype
			}
			//@ts-ignore
		} = BaseConstructorPrototype.bind(this, _target);

		self.prototype = {
			constructor: BaseConstructorPrototype
		};

		return self as T;

	}

	// @ts-ignore
	if (this[SymbolTypeomaticaProxyReference]) {
		return this;
	}

	const target = baseTarget(_target) as object;

	const InstancePrototype = getTypeomaticaProxyReference(target);

	let proto;
	let protoPointer = this as object;
	let protoConstrcutor;

	let constructors = false;

	// @ts-ignore
	// const hasProxyReference = protoPointer[SymbolTypeomaticaProxyReference] as unknown as boolean;
	// if (hasProxyReference) {
	// 	throw new Error('Multiple TypeØmatica instantiations are not allowed for the same Prototype Chain!');
	// }

	do {
		proto = protoPointer;
		protoPointer = Object.getPrototypeOf(proto);
		if (BaseConstructorPrototype.prototype === protoPointer) {
			constructors = true;
			break;
		}
		if (!protoPointer) break;
		const descriptor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor');
		if (!descriptor) continue;
		const value = descriptor.value || descriptor.get;
		// if (!value) continue;
		protoConstrcutor = value;
	} while (protoConstrcutor !== BaseConstructorPrototype);

	if (!constructors && protoConstrcutor !== BaseConstructorPrototype) {
		throw new Error('Unable to setup TypeØmatica handler!');
	}

	Object.setPrototypeOf(proto, InstancePrototype);
	return this;

} as {
	new(): unknown
	(): void
};

// const BaseConstructorProtoProxy = new Proxy(BaseConstructorPrototype, {
// 	construct (target: Function, argumentsList: unknown[], newTarget: Function) {
// 		debugger;
// 		console.log('.construct invocation');
// 		const result = Reflect.construct(target, argumentsList, newTarget);
// 		debugger;
// 		return result;
// 	},
// 	get (target: object, prop: string | symbol, receiver: object) {
// 		debugger;
// 		const result = Reflect.get(target, prop, receiver);
// 		debugger;
// 		return result;
// 	},
// 	set(_: object, prop: string, value: unknown, receiver: object) {
// 		debugger;
// 		const result = createProperty(prop, value, receiver);
// 		return result;
// 	},
// 	defineProperty(target: object, key: string, descriptor: object) {
// 		debugger;
// 		Reflect.defineProperty(target, key, descriptor);
// 		return true;
// 	},
// 	getPrototypeOf(target: object) {
// 		debugger;
// 		const result = Reflect.getPrototypeOf(target);
// 		return result;
// 	},
// 	setPrototypeOf(target, prototype) {
// 		debugger;
// 		Reflect.setPrototypeOf(target, prototype);
// 		return true;
// 	  },
// });

// as ObjectConstructor & {
// 	(): void
// 	new<T>(param?: T extends object ? T : {}): {
// 		[key in keyof T]: T[key]
// 	}
// };

Object.defineProperty(module, 'exports', {
	get() {
		// return BaseConstructorProtoProxy;
		return BaseConstructorPrototype;
	},
	enumerable: true
});

export class BaseClass {
	constructor(_target: object | null = null) {
		// @ts-ignore
		if (this[SymbolTypeomaticaProxyReference]) {
			return this;
		}

		const target = baseTarget(_target) as object;
		const proxy = getTypeomaticaProxyReference(target);
		// oxlint-disable-next-line typescript/no-this-alias
		let proto = this;
		let protoPointer = Object.getPrototypeOf(this);
		let found: boolean = false;
		do {
			protoPointer = Object.getPrototypeOf(proto);
			// if (protoPointer[SymbolTypeomaticaProxyReference]) {
			// 	throw new Error('Double TypeØmatica extension is not allowed!');
			// }
			if (protoPointer === Object.prototype) {
				found = true;
				break;
			}
			if (protoPointer === null) {
				found = true;
				break;
			}
			proto = protoPointer;
		} while (!found);
		Object.setPrototypeOf(proto, proxy);
	}
}

export { FieldConstructor } from './fields';
export const { SymbolInitialValue } = FieldConstructor;

type StrictRuntime = {
	// eslint-disable-next-line no-unused-vars
	<T extends object>(target: object): T
}

export const { Strict } = {
	Strict: BaseConstructorPrototype,
} as {
	// StrictPrototype: StrictRuntime
	Strict: StrictRuntime
};

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
Object.defineProperty(module.exports, 'SymbolInitialValue', {
	get() {
		return SymbolInitialValue;
	},
	enumerable: true
});
Object.defineProperty(module.exports, 'SymbolTypeomaticaProxyReference', {
	get() {
		return SymbolTypeomaticaProxyReference;
	},
	enumerable: true
});
Object.defineProperty(module.exports, 'Strict', {
	get() {
		return function (_target: object | null = null) {
			const decorator = function <T extends { new(): unknown, (): void }>(cstr: T): T {
				debugger;

				// @ts-ignore
				if (cstr.prototype[SymbolTypeomaticaProxyReference]) {
					return cstr;
				}

				const target = baseTarget(_target);
				const proxy = getTypeomaticaProxyReference(target);
				const _replacer = Object.create(proxy);

				Object.setPrototypeOf(cstr.prototype, _replacer);

				return cstr;


				// const MyClassProxy = new Proxy(cstr, {
				// 	construct(_, argumentsList, newTarget) {
				// 		debugger;
				// 		const target = baseTarget(_target);
				// 		const proxy = getTypeomaticaProxyReference(target);
				// 		const _replacer = Object.create(proxy);

				// 		const _proto = cstr.prototype;

				// 		const proto = Object.create(Object.getPrototypeOf(_proto));
				// 		proto.iAmProto = true;

				// 		Object.setPrototypeOf(cstr.prototype, proto);

				// 		const descriptors = Object.getOwnPropertyDescriptors(_proto);
				// 		Object.defineProperties(proto, descriptors);

				// 		const replacer = Object.create(_replacer);
				// 		Object.setPrototypeOf(proto, replacer);


				// 		Object.setPrototypeOf(cstr.prototype, proto);
				// 		const result = Reflect.construct(cstr, argumentsList, newTarget);

				// 		debugger;
				// 		Object.setPrototypeOf(cstr.prototype, _proto);
				// 		debugger;

				// 		return result;
				// 	},
				// });
				// return MyClassProxy;
			};

			return decorator;

		};
	},
	enumerable: true
});

Object.freeze(BaseConstructorPrototype);
Object.freeze(BaseConstructorPrototype.prototype);
