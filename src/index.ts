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
	frozenPrototypes?: boolean;
}

interface ConstructionRecord {
	fields    : Set<string | symbol>;
	options   : TypeomaticaOptions | undefined;
	finalized : boolean;
}

// Fields that passed through the define machinery, per instance.
// The postConstruction comparator (Thunderstruck design) diffs the
// instance's own descriptors against this Set to find fields added
// hiddenly — class fields and other define-semantics writes.
const constructionRecords = new WeakMap<object, ConstructionRecord>();

const ensureRecord = (instance: object): ConstructionRecord => {
	let record = constructionRecords.get(instance);
	if (!record) {
		record = {
			fields    : new Set(),
			options   : undefined,
			finalized : false
		};
		constructionRecords.set(instance, record);
	}
	return record;
};

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

const createProperty = (propName: string | symbol, initialValue: unknown, receiver: object, options?: TypeomaticaOptions, configurable = false) => {

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
			configurable,
			// @ts-ignore
			...resolver[types](value, receiver),
		};

	// if (value instanceof FieldConstructor) {
	// 	descriptor;
	// 	debugger;
	// }

	const result = Reflect.defineProperty(receiver, propName, descriptor);

	const record = ensureRecord(receiver);
	record.fields.add(propName);
	record.options = options;

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
		if (prop === 'constructor') {
			return undefined;
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
	const { frozenPrototypes: freezeProtos = true } = options || {};

	const InstancePrototype = getTypeomaticaProxyReference(target, options);

	const classPrototype = Object.getPrototypeOf(this) as object;

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
	if (freezeProtos) {
		Object.freeze(classPrototype);
	}
	// @ts-ignore
	return this;

/* eslint-disable no-unused-vars */
} as {
	new<T extends object | {}>(_target?: T, options?: TypeomaticaOptions): T
	<T extends object | {}, S extends T>(_target?: S extends infer InferredS ? InferredS : {}, options?: TypeomaticaOptions): S
};
/* eslint-enable no-unused-vars */

const freezeClassPrototypes = (instance: object, shouldFreeze: boolean) => {
	if (!shouldFreeze) {
		return;
	}

	const first = Object.getPrototypeOf(instance);
	const firstIsProxy = first !== null && !!Reflect.getOwnPropertyDescriptor(first, SymbolTypeomaticaProxyReference);
	if (firstIsProxy) {
		Object.freeze(BaseClass.prototype);
		return;
	}

	let p = first;
	while (p !== null && p !== BaseClass.prototype && p !== Object.prototype) {
		const next = Object.getPrototypeOf(p);
		const nextIsProxy = next !== null && !!Reflect.getOwnPropertyDescriptor(next, SymbolTypeomaticaProxyReference);
		Object.freeze(p);
		if (nextIsProxy) {
			break;
		}
		p = next;
	}
	Object.freeze(BaseClass.prototype);
};

export class BaseClass {
	constructor(_target?: object, options?: TypeomaticaOptions) {
		const { frozenPrototypes: freezeProtos = true } = options || {};

		// @ts-ignore
		if (this[SymbolTypeomaticaProxyReference]) {
			freezeClassPrototypes(this, freezeProtos);
			return this;
		}

		const target = baseTarget(_target) as object;
		const proxy = getTypeomaticaProxyReference(target, options);
		const instanceProto = Object.getPrototypeOf(this);

		if (instanceProto === BaseClass.prototype) {
			Object.setPrototypeOf(this, proxy);
			freezeClassPrototypes(this, freezeProtos);
			return this;
		}

		let classProto = instanceProto;
		let parentProto = Object.getPrototypeOf(classProto);
		while (parentProto !== BaseClass.prototype && parentProto !== null) {
			classProto = parentProto;
			parentProto = Object.getPrototypeOf(classProto);
		}

		Object.setPrototypeOf(classProto, proxy);
		freezeClassPrototypes(this, freezeProtos);
	}
}


const strict = function (_target?: object, options?: TypeomaticaOptions) {
	const { frozenPrototypes: freezeProtos = true } = options || {};

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
		if (freezeProtos) {
			// @ts-ignore
			Object.freeze(cstr.prototype);
		}

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

/**
 * Fields that certainly passed through the define machinery for this
 * instance. Returns a copy of the internal Set — safe for the caller
 * to mutate.
 */
export const getConstructedFields = (instance: object): Set<string | symbol> => {
	const record = constructionRecords.get(instance);
	const result = record ? new Set(record.fields) : new Set<string | symbol>();
	return result;
};

const finaliseFields = (instance: object, names: (string | symbol)[]): void => {
	const record = ensureRecord(instance);
	names.forEach((name) => {
		if (record.fields.has(name)) {
			// already passed through the machinery
			return;
		}
		const descriptor = Reflect.getOwnPropertyDescriptor(instance, name);
		if (!descriptor || !('value' in descriptor)) {
			// nothing hidden under that name, or not a data field
			return;
		}
		delete (instance as Record<PropertyKey, unknown>)[name];
		// finalized fields stay configurable: they are the ones `unwrap`
		// is allowed to turn back into plain value properties
		createProperty(name, descriptor.value, instance, record.options, true);
	});
};

/**
 * Auto finalization: every hiddenly-added own field of the instance
 * (class fields and other define-semantics writes that bypassed the
 * proxy) is deleted and re-established through the define machinery.
 * Sets the finalized flag — `true` means auto mode ran.
 */
export const finalize = (instance: object): void => {
	const record = ensureRecord(instance);
	finaliseFields(instance, Reflect.ownKeys(instance));
	record.finalized = true;
};

/**
 * Partial finalization: re-establish only the listed fields.
 * Does NOT set the finalized flag — that flag means auto mode ran,
 * everything else is the user's choice.
 */
export const finalizeBy = (instance: object, fields: (string | symbol)[]): void => {
	finaliseFields(instance, fields);
};

export const isFinalized = (instance: object): boolean => {
	const record = constructionRecords.get(instance);
	const result = record ? record.finalized : false;
	return result;
};

/**
 * Turn a guarded field back into a plain value property.
 * Allowed only for fields re-established by finalize/finalizeBy —
 * they stay configurable by design. Fields guarded since construction
 * are non-configurable: that lock is the essential design of the lib.
 * Primitives are read back via .valueOf(); objects are placed as-is.
 */
export const unwrap = (instance: object, field: string | symbol): void => {
	const descriptor = Reflect.getOwnPropertyDescriptor(instance, field);
	if (!descriptor || !descriptor.configurable || typeof descriptor.get !== 'function') {
		throw new TypeError(ErrorsNames.FORBIDDEN_UNWRAP);
	}
	const current = (instance as Record<PropertyKey, unknown>)[field];
	const currentValueOf = (current as { valueOf?: unknown })?.valueOf;
	const unwrapped = typeof currentValueOf === 'function'
		? (current as { valueOf: () => unknown }).valueOf()
		: current;
	Object.defineProperty(instance, field, {
		value        : unwrapped,
		writable     : true,
		enumerable   : true,
		configurable : true
	});
};

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
	Object.defineProperty(module.exports, 'getConstructedFields', {
		get() {
			return getConstructedFields;
		},
		enumerable: true
	});
	Object.defineProperty(module.exports, 'finalize', {
		get() {
			return finalize;
		},
		enumerable: true
	});
	Object.defineProperty(module.exports, 'finalizeBy', {
		get() {
			return finalizeBy;
		},
		enumerable: true
	});
	Object.defineProperty(module.exports, 'isFinalized', {
		get() {
			return isFinalized;
		},
		enumerable: true
	});
	Object.defineProperty(module.exports, 'unwrap', {
		get() {
			return unwrap;
		},
		enumerable: true
	});
}

setupCommonJS();

Object.freeze(BaseConstructorPrototype);
Object.freeze(BaseConstructorPrototype.prototype);
