// oxlint-disable typescript/no-this-alias
 
'use strict';

import { inspect } from 'util';
import { ErrorsNames } from './errors.js';

import {
	functions,
	nullish,
	objects,
	primitives,
	special,
	isPrimitive
} from './types/index.js';

import { FieldConstructor } from './fields.js';

export interface TypeomaticaOptions {
	strictAccessCheck?: boolean;
}

const createResolver = (options: TypeomaticaOptions = {}) => {
	const { strictAccessCheck = false } = options;
	
	return Object.entries({
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
					if (strictAccessCheck && invocationThis !== receiver) {
						throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
					}
					const result = handler.get();
					return result;
				},
				set(replacementValue: unknown) {
					const invocationThis = this;
					if (strictAccessCheck && invocationThis !== receiver) {
						throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
					}
					const result = handler.set(replacementValue);
					return result;
				}
			};
		};

		return obj;
	}, {});
};

const createProperty = (propName: string, initialValue: unknown, receiver: object, options?: TypeomaticaOptions) => {

	const value = initialValue;
	const valueIsPrimitive = isPrimitive(initialValue);
	const isObject = typeof initialValue === 'object';
	const isFunction = initialValue instanceof Function;
	const isNull = initialValue === null;

	/**
	 * special: undefined or BigInt or Symbol
	 * 	or other non constructible type
	 */

	const types = valueIsPrimitive ? 'primitives' : (
		isObject ? (
			isNull ? 'nullish' : 'objects'
		) : (
			isFunction ? 'functions' : 'special'
		)
	);

	const resolver = createResolver(options);

	const descriptor = (isObject && (value instanceof FieldConstructor)) ?
		value : {
			enumerable: true,
			// @ts-ignore
			...resolver[types](value, receiver),
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
const hasNodeInspect = (inspect && inspect.custom);
// oxlint-disable-next-line no-unused-expressions
(hasNodeInspect && (props2skip.add(inspect.custom)));

const createHandlers = (options?: TypeomaticaOptions) => ({
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
		// const errorMessage = `${ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] for ${name}`;
		// throw new Error(errorMessage);
	},
	set(_: object, prop: string, value: unknown, receiver: object) {
		const result = createProperty(prop, value, receiver, options);
		return result;
	},
	setPrototypeOf() {
		throw new Error('Setting prototype is not allowed!');
	},
	// defineProperty(target: object, key: string, descriptor: object) {
	defineProperty() {
		throw new Error('Defining new Properties is not allowed!');
		// Reflect.defineProperty(target, key, descriptor);
	},
	deleteProperty() {
		throw new Error('Properties Deletion is not allowed!');
	},
	// getPrototypeOf() {
	// 	debugger;
	// 	throw new Error('Getting prototype is not allowed');
	// },
});

// user have to precisely define all props
export const baseTarget = (_proto?: object) => {
	const proto = typeof _proto === 'object' ? _proto : null;
	const answer = Object.create(proto);
	return answer;
};

export const SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target: object, options?: TypeomaticaOptions) => {
	const target = Object.create(_target);
	const id = `TypeØmaticaProxyReference-${Math.random()}`;
	Object.defineProperty(target, SymbolTypeomaticaProxyReference, {
		get() {
			return id;
		}
	});
	const handlers = createHandlers(options);
	const proxy = new Proxy(target, handlers);
	return proxy;
};


export const BaseConstructorPrototype = function <T extends object, S extends T>(this: S extends T ? S : {}, _target?: T, options?: TypeomaticaOptions ): T {
	if (!new.target) {

		const self: {
			prototype: {
				constructor: typeof BaseConstructorPrototype
			}
			//@ts-ignore
		} = BaseConstructorPrototype.bind(this, _target, options);

		self.prototype = {
			constructor: BaseConstructorPrototype
		};

		// @ts-ignore
		return self;

	}

	// @ts-ignore
	if (this[SymbolTypeomaticaProxyReference]) {
		// @ts-ignore
		return this;
	}

	const target = baseTarget(_target) as object;

	const InstancePrototype = getTypeomaticaProxyReference(target, options);

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
	// @ts-ignore
	return this;

/* eslint-disable no-unused-vars */
} as {
	new<T extends object | {}>(_target?: T, options?: TypeomaticaOptions): T
	<T extends object | {}, S extends T>(_target?: S extends infer InferredS ? InferredS : {}, options?: TypeomaticaOptions): S
};
/* eslint-enable no-unused-vars */

export class BaseClass {
	constructor(_target?: object, options?: TypeomaticaOptions) {
		// @ts-ignore
		if (this[SymbolTypeomaticaProxyReference]) {
			return this;
		}

		const target = baseTarget(_target) as object;
		const proxy = getTypeomaticaProxyReference(target, options);
		let proto: object | null = this;
		let protoPointer: object | null;
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
			/*
			// it can be, that protoPointer === null
			// though too hard to implement this test
			*/
			proto = protoPointer;
		} while (!found);
		Object.setPrototypeOf(proto, proxy);
	}
}


const strict = function (_target?: object, options?: TypeomaticaOptions) {
	const decorator = function<T>(cstr: T): T {

		// @ts-ignore
		if (cstr.prototype[SymbolTypeomaticaProxyReference]) {
			return cstr;
		}

		const target = baseTarget(_target);
		const proxy = getTypeomaticaProxyReference(target, options);
		const _replacer = Object.create(proxy);

		// @ts-ignore
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
export const { SymbolInitialValue } = FieldConstructor;
const FieldConstructorExport = FieldConstructor;
export { FieldConstructorExport as FieldConstructor };
export const Strict = strict;

/* istanbul ignore next */
function setupCommonJS() {
	if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
		return;
	}
	Object.defineProperty(module, 'exports', {
		get() {
			return BaseConstructorPrototype;
		},
		enumerable: true
	});

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
	Object.defineProperty(module.exports, 'baseTarget', {
		get() {
			return baseTarget;
		},
		enumerable: true
	});
	Object.defineProperty(module.exports, 'Strict', {
		get() {
			return strict;
		},
		enumerable: true
	});
}

setupCommonJS();

Object.freeze(BaseConstructorPrototype);
Object.freeze(BaseConstructorPrototype.prototype);
