// oxlint-disable typescript/no-this-alias
'use strict';
import { inspect } from 'util';
import { ErrorsNames } from './errors.js';
import { functions, nullish, objects, primitives, special, isPrimitive } from './types/index.js';
import { FieldConstructor } from './fields.js';
// Fields that passed through the define machinery, per instance.
// The postConstruction comparator (Thunderstruck design) diffs the
// instance's own descriptors against this Set to find fields added
// hiddenly — class fields and other define-semantics writes.
const constructionRecords = new WeakMap();
const ensureRecord = (instance) => {
    let record = constructionRecords.get(instance);
    if (!record) {
        record = {
            fields: new Set(),
            options: undefined,
            finalized: false
        };
        constructionRecords.set(instance, record);
    }
    return record;
};
const createResolver = (options = {}) => {
    const { strictAccessCheck = false } = options;
    return Object.entries({
        primitives,
        special,
        nullish,
        objects,
        functions
    }).reduce((obj, [key, _handler]) => {
        // @ts-ignore
        obj[key] = function (initialValue, receiver) {
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
                set(replacementValue) {
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
const createProperty = (propName, initialValue, receiver, options, configurable = false) => {
    const value = initialValue;
    const valueIsPrimitive = isPrimitive(initialValue);
    const isObject = typeof initialValue === 'object';
    const isFunction = initialValue instanceof Function;
    const isNull = initialValue === null;
    /**
     * special: undefined or BigInt or Symbol
     * 	or other non constructible type
     */
    const types = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
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
const createHandlers = (options) => ({
    get(target, prop, receiver) {
        const result = Reflect.get(target, prop, receiver);
        if (result !== undefined) {
            return result;
        }
        if (prop === 'toJSON') {
            // eslint-disable-next-line no-unused-vars
            return function () {
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
    set(_, prop, value, receiver) {
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
export const baseTarget = (_proto) => {
    const proto = typeof _proto === 'object' ? _proto : null;
    const answer = Object.create(proto);
    return answer;
};
export const SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target, options) => {
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
export const BaseConstructorPrototype = function (_target, options) {
    if (!new.target) {
        const self = BaseConstructorPrototype.bind(this, _target, options);
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
    const target = baseTarget(_target);
    const { frozenPrototypes: freezeProtos = true } = options || {};
    const InstancePrototype = getTypeomaticaProxyReference(target, options);
    const classPrototype = Object.getPrototypeOf(this);
    let proto;
    let protoPointer = this;
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
        if (!protoPointer)
            break;
        const descriptor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor');
        if (!descriptor)
            continue;
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
};
/* eslint-enable no-unused-vars */
const freezeClassPrototypes = (instance, shouldFreeze) => {
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
    constructor(_target, options) {
        const { frozenPrototypes: freezeProtos = true } = options || {};
        // @ts-ignore
        if (this[SymbolTypeomaticaProxyReference]) {
            freezeClassPrototypes(this, freezeProtos);
            return this;
        }
        const target = baseTarget(_target);
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
const strict = function (_target, options) {
    const { frozenPrototypes: freezeProtos = true } = options || {};
    const decorator = function (cstr) {
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
export const getConstructedFields = (instance) => {
    const record = constructionRecords.get(instance);
    const result = record ? new Set(record.fields) : new Set();
    return result;
};
const finaliseFields = (instance, names) => {
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
        delete instance[name];
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
export const finalize = (instance) => {
    const record = ensureRecord(instance);
    finaliseFields(instance, Reflect.ownKeys(instance));
    record.finalized = true;
};
/**
 * Partial finalization: re-establish only the listed fields.
 * Does NOT set the finalized flag — that flag means auto mode ran,
 * everything else is the user's choice.
 */
export const finalizeBy = (instance, fields) => {
    finaliseFields(instance, fields);
};
export const isFinalized = (instance) => {
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
export const unwrap = (instance, field) => {
    const descriptor = Reflect.getOwnPropertyDescriptor(instance, field);
    if (!descriptor || !descriptor.configurable || typeof descriptor.get !== 'function') {
        throw new TypeError(ErrorsNames.FORBIDDEN_UNWRAP);
    }
    const current = instance[field];
    const currentValueOf = current?.valueOf;
    const unwrapped = typeof currentValueOf === 'function'
        ? current.valueOf()
        : current;
    Object.defineProperty(instance, field, {
        value: unwrapped,
        writable: true,
        enumerable: true,
        configurable: true
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMENBQTBDO0FBRTFDLFlBQVksQ0FBQztBQUViLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUUxQyxPQUFPLEVBQ04sU0FBUyxFQUNULE9BQU8sRUFDUCxPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxXQUFXLEVBQ1gsTUFBTSxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFhL0MsaUVBQWlFO0FBQ2pFLG1FQUFtRTtBQUNuRSxtRUFBbUU7QUFDbkUsNkRBQTZEO0FBQzdELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxPQUFPLEVBQThCLENBQUM7QUFFdEUsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFnQixFQUFzQixFQUFFO0lBQzdELElBQUksTUFBTSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDYixNQUFNLEdBQUc7WUFDUixNQUFNLEVBQU0sSUFBSSxHQUFHLEVBQUU7WUFDckIsT0FBTyxFQUFLLFNBQVM7WUFDckIsU0FBUyxFQUFHLEtBQUs7U0FDakIsQ0FBQztRQUNGLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxjQUFjLEdBQUcsQ0FBQyxVQUE4QixFQUFFLEVBQUUsRUFBRTtJQUMzRCxNQUFNLEVBQUUsaUJBQWlCLEdBQUcsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTlDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FB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LE1BQU0sQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBveGxpbnQtZGlzYWJsZSB0eXBlc2NyaXB0L25vLXRoaXMtYWxpYXNcbiBcbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgaW5zcGVjdCB9IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHsgRXJyb3JzTmFtZXMgfSBmcm9tICcuL2Vycm9ycy5qcyc7XG5cbmltcG9ydCB7XG5cdGZ1bmN0aW9ucyxcblx0bnVsbGlzaCxcblx0b2JqZWN0cyxcblx0cHJpbWl0aXZlcyxcblx0c3BlY2lhbCxcblx0aXNQcmltaXRpdmVcbn0gZnJvbSAnLi90eXBlcy9pbmRleC5qcyc7XG5cbmltcG9ydCB7IEZpZWxkQ29uc3RydWN0b3IgfSBmcm9tICcuL2ZpZWxkcy5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZW9tYXRpY2FPcHRpb25zIHtcblx0c3RyaWN0QWNjZXNzQ2hlY2s/OiBib29sZWFuO1xuXHRmcm96ZW5Qcm90b3R5cGVzPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIENvbnN0cnVjdGlvblJlY29yZCB7XG5cdGZpZWxkcyAgICA6IFNldDxzdHJpbmcgfCBzeW1ib2w+O1xuXHRvcHRpb25zICAgOiBUeXBlb21hdGljYU9wdGlvbnMgfCB1bmRlZmluZWQ7XG5cdGZpbmFsaXplZCA6IGJvb2xlYW47XG59XG5cbi8vIEZpZWxkcyB0aGF0IHBhc3NlZCB0aHJvdWdoIHRoZSBkZWZpbmUgbWFjaGluZXJ5LCBwZXIgaW5zdGFuY2UuXG4vLyBUaGUgcG9zdENvbnN0cnVjdGlvbiBjb21wYXJhdG9yIChUaHVuZGVyc3RydWNrIGRlc2lnbikgZGlmZnMgdGhlXG4vLyBpbnN0YW5jZSdzIG93biBkZXNjcmlwdG9ycyBhZ2FpbnN0IHRoaXMgU2V0IHRvIGZpbmQgZmllbGRzIGFkZGVkXG4vLyBoaWRkZW5seSDigJQgY2xhc3MgZmllbGRzIGFuZCBvdGhlciBkZWZpbmUtc2VtYW50aWNzIHdyaXRlcy5cbmNvbnN0IGNvbnN0cnVjdGlvblJlY29yZHMgPSBuZXcgV2Vha01hcDxvYmplY3QsIENvbnN0cnVjdGlvblJlY29yZD4oKTtcblxuY29uc3QgZW5zdXJlUmVjb3JkID0gKGluc3RhbmNlOiBvYmplY3QpOiBDb25zdHJ1Y3Rpb25SZWNvcmQgPT4ge1xuXHRsZXQgcmVjb3JkID0gY29uc3RydWN0aW9uUmVjb3Jkcy5nZXQoaW5zdGFuY2UpO1xuXHRpZiAoIXJlY29yZCkge1xuXHRcdHJlY29yZCA9IHtcblx0XHRcdGZpZWxkcyAgICA6IG5ldyBTZXQoKSxcblx0XHRcdG9wdGlvbnMgICA6IHVuZGVmaW5lZCxcblx0XHRcdGZpbmFsaXplZCA6IGZhbHNlXG5cdFx0fTtcblx0XHRjb25zdHJ1Y3Rpb25SZWNvcmRzLnNldChpbnN0YW5jZSwgcmVjb3JkKTtcblx0fVxuXHRyZXR1cm4gcmVjb3JkO1xufTtcblxuY29uc3QgY3JlYXRlUmVzb2x2ZXIgPSAob3B0aW9uczogVHlwZW9tYXRpY2FPcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgeyBzdHJpY3RBY2Nlc3NDaGVjayA9IGZhbHNlIH0gPSBvcHRpb25zO1xuXHRcblx0cmV0dXJuIE9iamVjdC5lbnRyaWVzKHtcblx0XHRwcmltaXRpdmVzLFxuXHRcdHNwZWNpYWwsXG5cdFx0bnVsbGlzaCxcblx0XHRvYmplY3RzLFxuXHRcdGZ1bmN0aW9uc1xuXHR9KS5yZWR1Y2UoKG9iajogb2JqZWN0LCBba2V5LCBfaGFuZGxlcl0pID0+IHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b2JqW2tleV0gPSBmdW5jdGlvbiAoaW5pdGlhbFZhbHVlOiBvYmplY3QsIHJlY2VpdmVyOiBvYmplY3QpIHtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBfaGFuZGxlcihpbml0aWFsVmFsdWUpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdGNvbnN0IGludm9jYXRpb25UaGlzID0gdGhpcztcblx0XHRcdFx0XHRpZiAoc3RyaWN0QWNjZXNzQ2hlY2sgJiYgaW52b2NhdGlvblRoaXMgIT09IHJlY2VpdmVyKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoRXJyb3JzTmFtZXMuQUNDRVNTX0RFTklFRCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGhhbmRsZXIuZ2V0KCk7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0KHJlcGxhY2VtZW50VmFsdWU6IHVua25vd24pIHtcblx0XHRcdFx0XHRjb25zdCBpbnZvY2F0aW9uVGhpcyA9IHRoaXM7XG5cdFx0XHRcdFx0aWYgKHN0cmljdEFjY2Vzc0NoZWNrICYmIGludm9jYXRpb25UaGlzICE9PSByZWNlaXZlcikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKEVycm9yc05hbWVzLkFDQ0VTU19ERU5JRUQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSBoYW5kbGVyLnNldChyZXBsYWNlbWVudFZhbHVlKTtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHRyZXR1cm4gb2JqO1xuXHR9LCB7fSk7XG59O1xuXG5jb25zdCBjcmVhdGVQcm9wZXJ0eSA9IChwcm9wTmFtZTogc3RyaW5nIHwgc3ltYm9sLCBpbml0aWFsVmFsdWU6IHVua25vd24sIHJlY2VpdmVyOiBvYmplY3QsIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMsIGNvbmZpZ3VyYWJsZSA9IGZhbHNlKSA9PiB7XG5cblx0Y29uc3QgdmFsdWUgPSBpbml0aWFsVmFsdWU7XG5cdGNvbnN0IHZhbHVlSXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZShpbml0aWFsVmFsdWUpO1xuXHRjb25zdCBpc09iamVjdCA9IHR5cGVvZiBpbml0aWFsVmFsdWUgPT09ICdvYmplY3QnO1xuXHRjb25zdCBpc0Z1bmN0aW9uID0gaW5pdGlhbFZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb247XG5cdGNvbnN0IGlzTnVsbCA9IGluaXRpYWxWYWx1ZSA9PT0gbnVsbDtcblxuXHQvKipcblx0ICogc3BlY2lhbDogdW5kZWZpbmVkIG9yIEJpZ0ludCBvciBTeW1ib2xcblx0ICogXHRvciBvdGhlciBub24gY29uc3RydWN0aWJsZSB0eXBlXG5cdCAqL1xuXG5cdGNvbnN0IHR5cGVzID0gdmFsdWVJc1ByaW1pdGl2ZSA/ICdwcmltaXRpdmVzJyA6IChcblx0XHRpc09iamVjdCA/IChcblx0XHRcdGlzTnVsbCA/ICdudWxsaXNoJyA6ICdvYmplY3RzJ1xuXHRcdCkgOiAoXG5cdFx0XHRpc0Z1bmN0aW9uID8gJ2Z1bmN0aW9ucycgOiAnc3BlY2lhbCdcblx0XHQpXG5cdCk7XG5cblx0Y29uc3QgcmVzb2x2ZXIgPSBjcmVhdGVSZXNvbHZlcihvcHRpb25zKTtcblxuXHRjb25zdCBkZXNjcmlwdG9yID0gKGlzT2JqZWN0ICYmICh2YWx1ZSBpbnN0YW5jZW9mIEZpZWxkQ29uc3RydWN0b3IpKSA/XG5cdFx0dmFsdWUgOiB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlLFxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0Li4ucmVzb2x2ZXJbdHlwZXNdKHZhbHVlLCByZWNlaXZlciksXG5cdFx0fTtcblxuXHQvLyBpZiAodmFsdWUgaW5zdGFuY2VvZiBGaWVsZENvbnN0cnVjdG9yKSB7XG5cdC8vIFx0ZGVzY3JpcHRvcjtcblx0Ly8gXHRkZWJ1Z2dlcjtcblx0Ly8gfVxuXG5cdGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuZGVmaW5lUHJvcGVydHkocmVjZWl2ZXIsIHByb3BOYW1lLCBkZXNjcmlwdG9yKTtcblxuXHRjb25zdCByZWNvcmQgPSBlbnN1cmVSZWNvcmQocmVjZWl2ZXIpO1xuXHRyZWNvcmQuZmllbGRzLmFkZChwcm9wTmFtZSk7XG5cdHJlY29yZC5vcHRpb25zID0gb3B0aW9ucztcblxuXHRyZXR1cm4gcmVzdWx0O1xuXG59O1xuXG4vLyBsaW5lIGJlbG93ICdocmVmJyBpcyBmb3IgdXRpbC5pbnNwZWN0IHdvcmtzLCB1c2VmdWwgZm9yIHYyNFxuY29uc3QgcHJvcHMyc2tpcCA9IG5ldyBTZXQoW1xuXHRTeW1ib2wudG9TdHJpbmdUYWcsXG5cdFN5bWJvbC5pdGVyYXRvcixcblx0Ly8gU3ltYm9sLnRvUHJpbWl0aXZlLFxuXHQndG9TdHJpbmcnLFxuXHQndmFsdWVPZicsXG5cdCdocmVmJ1xuXSk7XG4vLyBjb25zdCBwcm9wczJza2lwID0gbmV3IFNldChbU3ltYm9sLnRvU3RyaW5nVGFnLCBTeW1ib2wuaXRlcmF0b3JdKTtcbmNvbnN0IGhhc05vZGVJbnNwZWN0ID0gKGluc3BlY3QgJiYgaW5zcGVjdC5jdXN0b20pO1xuLy8gb3hsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuKGhhc05vZGVJbnNwZWN0ICYmIChwcm9wczJza2lwLmFkZChpbnNwZWN0LmN1c3RvbSkpKTtcblxuY29uc3QgY3JlYXRlSGFuZGxlcnMgPSAob3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucykgPT4gKHtcblx0Z2V0KHRhcmdldDogb2JqZWN0LCBwcm9wOiBzdHJpbmcgfCBzeW1ib2wsIHJlY2VpdmVyOiBvYmplY3QpIHtcblx0XHRjb25zdCByZXN1bHQgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcblx0XHRpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGlmIChwcm9wID09PSAndG9KU09OJykge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHRoaXM6IHR5cGVvZiB0YXJnZXQpIHtcblx0XHRcdFx0Y29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZW50cmllcy5yZWR1Y2UoKG9iaiwgW2tleSwgdmFsdWVdKSA9PiB7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9ialtrZXldID0gdmFsdWUudmFsdWVPZigpO1xuXHRcdFx0XHRcdHJldHVybiBvYmo7XG5cdFx0XHRcdH0sIHt9KSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRpZiAocHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0Y29uc3QgeyBuYW1lIH0gPSByZWNlaXZlci5jb25zdHJ1Y3Rvcjtcblx0XHRpZiAocHJvcHMyc2tpcC5oYXMocHJvcCkpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgJHtuYW1lfSBsYWNrcyBkZWZpbml0aW9uIG9mIFsgJHtTdHJpbmcocHJvcCkudmFsdWVPZigpfSBdYDtcblx0XHRcdHJldHVybiBtZXNzYWdlO1xuXHRcdH1cblx0XHQvLyBjb25zdCBlcnJvck1lc3NhZ2UgPSBgJHtFcnJvcnNOYW1lcy5NSVNTSU5HX1BST1B9OiBbICR7U3RyaW5nKHByb3ApLnZhbHVlT2YoKX0gXSBmb3IgJHtuYW1lfWA7XG5cdFx0Ly8gdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG5cdH0sXG5cdHNldChfOiBvYmplY3QsIHByb3A6IHN0cmluZywgdmFsdWU6IHVua25vd24sIHJlY2VpdmVyOiBvYmplY3QpIHtcblx0XHRjb25zdCByZXN1bHQgPSBjcmVhdGVQcm9wZXJ0eShwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIsIG9wdGlvbnMpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdHNldFByb3RvdHlwZU9mKCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignU2V0dGluZyBwcm90b3R5cGUgaXMgbm90IGFsbG93ZWQhJyk7XG5cdH0sXG5cdC8vIGRlZmluZVByb3BlcnR5KHRhcmdldDogb2JqZWN0LCBrZXk6IHN0cmluZywgZGVzY3JpcHRvcjogb2JqZWN0KSB7XG5cdGRlZmluZVByb3BlcnR5KCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignRGVmaW5pbmcgbmV3IFByb3BlcnRpZXMgaXMgbm90IGFsbG93ZWQhJyk7XG5cdFx0Ly8gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgZGVzY3JpcHRvcik7XG5cdH0sXG5cdGRlbGV0ZVByb3BlcnR5KCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignUHJvcGVydGllcyBEZWxldGlvbiBpcyBub3QgYWxsb3dlZCEnKTtcblx0fSxcblx0Ly8gZ2V0UHJvdG90eXBlT2YoKSB7XG5cdC8vIFx0ZGVidWdnZXI7XG5cdC8vIFx0dGhyb3cgbmV3IEVycm9yKCdHZXR0aW5nIHByb3RvdHlwZSBpcyBub3QgYWxsb3dlZCcpO1xuXHQvLyB9LFxufSk7XG5cbi8vIHVzZXIgaGF2ZSB0byBwcmVjaXNlbHkgZGVmaW5lIGFsbCBwcm9wc1xuZXhwb3J0IGNvbnN0IGJhc2VUYXJnZXQgPSAoX3Byb3RvPzogb2JqZWN0KSA9PiB7XG5cdGNvbnN0IHByb3RvID0gdHlwZW9mIF9wcm90byA9PT0gJ29iamVjdCcgPyBfcHJvdG8gOiBudWxsO1xuXHRjb25zdCBhbnN3ZXIgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblx0cmV0dXJuIGFuc3dlcjtcbn07XG5cbmV4cG9ydCBjb25zdCBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlID0gU3ltYm9sKCdUeXBlw5htYXRpY2FQcm94eVJlZmVyZW5jZScpO1xuY29uc3QgZ2V0VHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSA9IChfdGFyZ2V0OiBvYmplY3QsIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpID0+IHtcblx0Y29uc3QgdGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZShfdGFyZ2V0KTtcblx0Y29uc3QgaWQgPSBgVHlwZcOYbWF0aWNhUHJveHlSZWZlcmVuY2UtJHtNYXRoLnJhbmRvbSgpfWA7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIFN5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gaWQ7XG5cdFx0fVxuXHR9KTtcblx0Y29uc3QgaGFuZGxlcnMgPSBjcmVhdGVIYW5kbGVycyhvcHRpb25zKTtcblx0Y29uc3QgcHJveHkgPSBuZXcgUHJveHkodGFyZ2V0LCBoYW5kbGVycyk7XG5cdHJldHVybiBwcm94eTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZSA9IGZ1bmN0aW9uIDxUIGV4dGVuZHMgb2JqZWN0LCBTIGV4dGVuZHMgVD4odGhpczogUyBleHRlbmRzIFQgPyBTIDoge30sIF90YXJnZXQ/OiBULCBvcHRpb25zPzogVHlwZW9tYXRpY2FPcHRpb25zICk6IFQge1xuXHRpZiAoIW5ldy50YXJnZXQpIHtcblxuXHRcdGNvbnN0IHNlbGY6IHtcblx0XHRcdHByb3RvdHlwZToge1xuXHRcdFx0XHRjb25zdHJ1Y3RvcjogdHlwZW9mIEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZVxuXHRcdFx0fVxuXHRcdFx0Ly9AdHMtaWdub3JlXG5cdFx0fSA9IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZS5iaW5kKHRoaXMsIF90YXJnZXQsIG9wdGlvbnMpO1xuXG5cdFx0c2VsZi5wcm90b3R5cGUgPSB7XG5cdFx0XHRjb25zdHJ1Y3RvcjogQmFzZUNvbnN0cnVjdG9yUHJvdG90eXBlXG5cdFx0fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gc2VsZjtcblxuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRpZiAodGhpc1tTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSkge1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNvbnN0IHRhcmdldCA9IGJhc2VUYXJnZXQoX3RhcmdldCkgYXMgb2JqZWN0O1xuXHRjb25zdCB7IGZyb3plblByb3RvdHlwZXM6IGZyZWV6ZVByb3RvcyA9IHRydWUgfSA9IG9wdGlvbnMgfHwge307XG5cblx0Y29uc3QgSW5zdGFuY2VQcm90b3R5cGUgPSBnZXRUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlKHRhcmdldCwgb3B0aW9ucyk7XG5cblx0Y29uc3QgY2xhc3NQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgYXMgb2JqZWN0O1xuXG5cdGxldCBwcm90bztcblx0bGV0IHByb3RvUG9pbnRlciA9IHRoaXMgYXMgb2JqZWN0O1xuXHRsZXQgcHJvdG9Db25zdHJjdXRvcjtcblxuXHRsZXQgY29uc3RydWN0b3JzID0gZmFsc2U7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHQvLyBjb25zdCBoYXNQcm94eVJlZmVyZW5jZSA9IHByb3RvUG9pbnRlcltTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSBhcyB1bmtub3duIGFzIGJvb2xlYW47XG5cdC8vIGlmIChoYXNQcm94eVJlZmVyZW5jZSkge1xuXHQvLyBcdHRocm93IG5ldyBFcnJvcignTXVsdGlwbGUgVHlwZcOYbWF0aWNhIGluc3RhbnRpYXRpb25zIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhlIHNhbWUgUHJvdG90eXBlIENoYWluIScpO1xuXHQvLyB9XG5cblx0ZG8ge1xuXHRcdHByb3RvID0gcHJvdG9Qb2ludGVyO1xuXHRcdHByb3RvUG9pbnRlciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG5cdFx0aWYgKEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZS5wcm90b3R5cGUgPT09IHByb3RvUG9pbnRlcikge1xuXHRcdFx0Y29uc3RydWN0b3JzID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpZiAoIXByb3RvUG9pbnRlcikgYnJlYWs7XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvUG9pbnRlciwgJ2NvbnN0cnVjdG9yJyk7XG5cdFx0aWYgKCFkZXNjcmlwdG9yKSBjb250aW51ZTtcblx0XHRjb25zdCB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWUgfHwgZGVzY3JpcHRvci5nZXQ7XG5cdFx0Ly8gaWYgKCF2YWx1ZSkgY29udGludWU7XG5cdFx0cHJvdG9Db25zdHJjdXRvciA9IHZhbHVlO1xuXHR9IHdoaWxlIChwcm90b0NvbnN0cmN1dG9yICE9PSBCYXNlQ29uc3RydWN0b3JQcm90b3R5cGUpO1xuXG5cdGlmICghY29uc3RydWN0b3JzICYmIHByb3RvQ29uc3RyY3V0b3IgIT09IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHNldHVwIFR5cGXDmG1hdGljYSBoYW5kbGVyIScpO1xuXHR9XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHByb3RvLCBJbnN0YW5jZVByb3RvdHlwZSk7XG5cdGlmIChmcmVlemVQcm90b3MpIHtcblx0XHRPYmplY3QuZnJlZXplKGNsYXNzUHJvdG90eXBlKTtcblx0fVxuXHQvLyBAdHMtaWdub3JlXG5cdHJldHVybiB0aGlzO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xufSBhcyB7XG5cdG5ldzxUIGV4dGVuZHMgb2JqZWN0IHwge30+KF90YXJnZXQ/OiBULCBvcHRpb25zPzogVHlwZW9tYXRpY2FPcHRpb25zKTogVFxuXHQ8VCBleHRlbmRzIG9iamVjdCB8IHt9LCBTIGV4dGVuZHMgVD4oX3RhcmdldD86IFMgZXh0ZW5kcyBpbmZlciBJbmZlcnJlZFMgPyBJbmZlcnJlZFMgOiB7fSwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucyk6IFNcbn07XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbmNvbnN0IGZyZWV6ZUNsYXNzUHJvdG90eXBlcyA9IChpbnN0YW5jZTogb2JqZWN0LCBzaG91bGRGcmVlemU6IGJvb2xlYW4pID0+IHtcblx0aWYgKCFzaG91bGRGcmVlemUpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBmaXJzdCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihpbnN0YW5jZSk7XG5cdGNvbnN0IGZpcnN0SXNQcm94eSA9IGZpcnN0ICE9PSBudWxsICYmICEhUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZmlyc3QsIFN5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UpO1xuXHRpZiAoZmlyc3RJc1Byb3h5KSB7XG5cdFx0T2JqZWN0LmZyZWV6ZShCYXNlQ2xhc3MucHJvdG90eXBlKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgcCA9IGZpcnN0O1xuXHR3aGlsZSAocCAhPT0gbnVsbCAmJiBwICE9PSBCYXNlQ2xhc3MucHJvdG90eXBlICYmIHAgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcblx0XHRjb25zdCBuZXh0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHApO1xuXHRcdGNvbnN0IG5leHRJc1Byb3h5ID0gbmV4dCAhPT0gbnVsbCAmJiAhIVJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5leHQsIFN5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UpO1xuXHRcdE9iamVjdC5mcmVlemUocCk7XG5cdFx0aWYgKG5leHRJc1Byb3h5KSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cCA9IG5leHQ7XG5cdH1cblx0T2JqZWN0LmZyZWV6ZShCYXNlQ2xhc3MucHJvdG90eXBlKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBCYXNlQ2xhc3Mge1xuXHRjb25zdHJ1Y3RvcihfdGFyZ2V0Pzogb2JqZWN0LCBvcHRpb25zPzogVHlwZW9tYXRpY2FPcHRpb25zKSB7XG5cdFx0Y29uc3QgeyBmcm96ZW5Qcm90b3R5cGVzOiBmcmVlemVQcm90b3MgPSB0cnVlIH0gPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmICh0aGlzW1N5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2VdKSB7XG5cdFx0XHRmcmVlemVDbGFzc1Byb3RvdHlwZXModGhpcywgZnJlZXplUHJvdG9zKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRhcmdldCA9IGJhc2VUYXJnZXQoX3RhcmdldCkgYXMgb2JqZWN0O1xuXHRcdGNvbnN0IHByb3h5ID0gZ2V0VHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSh0YXJnZXQsIG9wdGlvbnMpO1xuXHRcdGNvbnN0IGluc3RhbmNlUHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyk7XG5cblx0XHRpZiAoaW5zdGFuY2VQcm90byA9PT0gQmFzZUNsYXNzLnByb3RvdHlwZSkge1xuXHRcdFx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIHByb3h5KTtcblx0XHRcdGZyZWV6ZUNsYXNzUHJvdG90eXBlcyh0aGlzLCBmcmVlemVQcm90b3MpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0bGV0IGNsYXNzUHJvdG8gPSBpbnN0YW5jZVByb3RvO1xuXHRcdGxldCBwYXJlbnRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjbGFzc1Byb3RvKTtcblx0XHR3aGlsZSAocGFyZW50UHJvdG8gIT09IEJhc2VDbGFzcy5wcm90b3R5cGUgJiYgcGFyZW50UHJvdG8gIT09IG51bGwpIHtcblx0XHRcdGNsYXNzUHJvdG8gPSBwYXJlbnRQcm90bztcblx0XHRcdHBhcmVudFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNsYXNzUHJvdG8pO1xuXHRcdH1cblxuXHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZihjbGFzc1Byb3RvLCBwcm94eSk7XG5cdFx0ZnJlZXplQ2xhc3NQcm90b3R5cGVzKHRoaXMsIGZyZWV6ZVByb3Rvcyk7XG5cdH1cbn1cblxuXG5jb25zdCBzdHJpY3QgPSBmdW5jdGlvbiAoX3RhcmdldD86IG9iamVjdCwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucykge1xuXHRjb25zdCB7IGZyb3plblByb3RvdHlwZXM6IGZyZWV6ZVByb3RvcyA9IHRydWUgfSA9IG9wdGlvbnMgfHwge307XG5cblx0Y29uc3QgZGVjb3JhdG9yID0gZnVuY3Rpb248VD4oY3N0cjogVCk6IFQge1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmIChjc3RyLnByb3RvdHlwZVtTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSkge1xuXHRcdFx0cmV0dXJuIGNzdHI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gYmFzZVRhcmdldChfdGFyZ2V0KTtcblx0XHRjb25zdCBwcm94eSA9IGdldFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UodGFyZ2V0LCBvcHRpb25zKTtcblx0XHRjb25zdCBfcmVwbGFjZXIgPSBPYmplY3QuY3JlYXRlKHByb3h5KTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY3N0ci5wcm90b3R5cGUsIF9yZXBsYWNlcik7XG5cdFx0aWYgKGZyZWV6ZVByb3Rvcykge1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0T2JqZWN0LmZyZWV6ZShjc3RyLnByb3RvdHlwZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNzdHI7XG5cblxuXHRcdC8vIGNvbnN0IE15Q2xhc3NQcm94eSA9IG5ldyBQcm94eShjc3RyLCB7XG5cdFx0Ly8gXHRjb25zdHJ1Y3QoXywgYXJndW1lbnRzTGlzdCwgbmV3VGFyZ2V0KSB7XG5cdFx0Ly8gXHRcdGRlYnVnZ2VyO1xuXHRcdC8vIFx0XHRjb25zdCB0YXJnZXQgPSBiYXNlVGFyZ2V0KF90YXJnZXQpO1xuXHRcdC8vIFx0XHRjb25zdCBwcm94eSA9IGdldFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UodGFyZ2V0KTtcblx0XHQvLyBcdFx0Y29uc3QgX3JlcGxhY2VyID0gT2JqZWN0LmNyZWF0ZShwcm94eSk7XG5cblx0XHQvLyBcdFx0Y29uc3QgX3Byb3RvID0gY3N0ci5wcm90b3R5cGU7XG5cblx0XHQvLyBcdFx0Y29uc3QgcHJvdG8gPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihfcHJvdG8pKTtcblx0XHQvLyBcdFx0cHJvdG8uaUFtUHJvdG8gPSB0cnVlO1xuXG5cdFx0Ly8gXHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZihjc3RyLnByb3RvdHlwZSwgcHJvdG8pO1xuXG5cdFx0Ly8gXHRcdGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoX3Byb3RvKTtcblx0XHQvLyBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMocHJvdG8sIGRlc2NyaXB0b3JzKTtcblxuXHRcdC8vIFx0XHRjb25zdCByZXBsYWNlciA9IE9iamVjdC5jcmVhdGUoX3JlcGxhY2VyKTtcblx0XHQvLyBcdFx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHByb3RvLCByZXBsYWNlcik7XG5cblxuXHRcdC8vIFx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY3N0ci5wcm90b3R5cGUsIHByb3RvKTtcblx0XHQvLyBcdFx0Y29uc3QgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoY3N0ciwgYXJndW1lbnRzTGlzdCwgbmV3VGFyZ2V0KTtcblxuXHRcdC8vIFx0XHRkZWJ1Z2dlcjtcblx0XHQvLyBcdFx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNzdHIucHJvdG90eXBlLCBfcHJvdG8pO1xuXHRcdC8vIFx0XHRkZWJ1Z2dlcjtcblxuXHRcdC8vIFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdC8vIFx0fSxcblx0XHQvLyB9KTtcblx0XHQvLyByZXR1cm4gTXlDbGFzc1Byb3h5O1xuXHR9O1xuXG5cdHJldHVybiBkZWNvcmF0b3I7XG5cbn07XG5leHBvcnQgY29uc3QgeyBTeW1ib2xJbml0aWFsVmFsdWUgfSA9IEZpZWxkQ29uc3RydWN0b3I7XG5jb25zdCBGaWVsZENvbnN0cnVjdG9yRXhwb3J0ID0gRmllbGRDb25zdHJ1Y3RvcjtcbmV4cG9ydCB7IEZpZWxkQ29uc3RydWN0b3JFeHBvcnQgYXMgRmllbGRDb25zdHJ1Y3RvciB9O1xuZXhwb3J0IGNvbnN0IFN0cmljdCA9IHN0cmljdDtcblxuLyoqXG4gKiBGaWVsZHMgdGhhdCBjZXJ0YWlubHkgcGFzc2VkIHRocm91Z2ggdGhlIGRlZmluZSBtYWNoaW5lcnkgZm9yIHRoaXNcbiAqIGluc3RhbmNlLiBSZXR1cm5zIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgU2V0IOKAlCBzYWZlIGZvciB0aGUgY2FsbGVyXG4gKiB0byBtdXRhdGUuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb25zdHJ1Y3RlZEZpZWxkcyA9IChpbnN0YW5jZTogb2JqZWN0KTogU2V0PHN0cmluZyB8IHN5bWJvbD4gPT4ge1xuXHRjb25zdCByZWNvcmQgPSBjb25zdHJ1Y3Rpb25SZWNvcmRzLmdldChpbnN0YW5jZSk7XG5cdGNvbnN0IHJlc3VsdCA9IHJlY29yZCA/IG5ldyBTZXQocmVjb3JkLmZpZWxkcykgOiBuZXcgU2V0PHN0cmluZyB8IHN5bWJvbD4oKTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IGZpbmFsaXNlRmllbGRzID0gKGluc3RhbmNlOiBvYmplY3QsIG5hbWVzOiAoc3RyaW5nIHwgc3ltYm9sKVtdKTogdm9pZCA9PiB7XG5cdGNvbnN0IHJlY29yZCA9IGVuc3VyZVJlY29yZChpbnN0YW5jZSk7XG5cdG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRpZiAocmVjb3JkLmZpZWxkcy5oYXMobmFtZSkpIHtcblx0XHRcdC8vIGFscmVhZHkgcGFzc2VkIHRocm91Z2ggdGhlIG1hY2hpbmVyeVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaW5zdGFuY2UsIG5hbWUpO1xuXHRcdGlmICghZGVzY3JpcHRvciB8fCAhKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikpIHtcblx0XHRcdC8vIG5vdGhpbmcgaGlkZGVuIHVuZGVyIHRoYXQgbmFtZSwgb3Igbm90IGEgZGF0YSBmaWVsZFxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRkZWxldGUgKGluc3RhbmNlIGFzIFJlY29yZDxQcm9wZXJ0eUtleSwgdW5rbm93bj4pW25hbWVdO1xuXHRcdC8vIGZpbmFsaXplZCBmaWVsZHMgc3RheSBjb25maWd1cmFibGU6IHRoZXkgYXJlIHRoZSBvbmVzIGB1bndyYXBgXG5cdFx0Ly8gaXMgYWxsb3dlZCB0byB0dXJuIGJhY2sgaW50byBwbGFpbiB2YWx1ZSBwcm9wZXJ0aWVzXG5cdFx0Y3JlYXRlUHJvcGVydHkobmFtZSwgZGVzY3JpcHRvci52YWx1ZSwgaW5zdGFuY2UsIHJlY29yZC5vcHRpb25zLCB0cnVlKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIEF1dG8gZmluYWxpemF0aW9uOiBldmVyeSBoaWRkZW5seS1hZGRlZCBvd24gZmllbGQgb2YgdGhlIGluc3RhbmNlXG4gKiAoY2xhc3MgZmllbGRzIGFuZCBvdGhlciBkZWZpbmUtc2VtYW50aWNzIHdyaXRlcyB0aGF0IGJ5cGFzc2VkIHRoZVxuICogcHJveHkpIGlzIGRlbGV0ZWQgYW5kIHJlLWVzdGFibGlzaGVkIHRocm91Z2ggdGhlIGRlZmluZSBtYWNoaW5lcnkuXG4gKiBTZXRzIHRoZSBmaW5hbGl6ZWQgZmxhZyDigJQgYHRydWVgIG1lYW5zIGF1dG8gbW9kZSByYW4uXG4gKi9cbmV4cG9ydCBjb25zdCBmaW5hbGl6ZSA9IChpbnN0YW5jZTogb2JqZWN0KTogdm9pZCA9PiB7XG5cdGNvbnN0IHJlY29yZCA9IGVuc3VyZVJlY29yZChpbnN0YW5jZSk7XG5cdGZpbmFsaXNlRmllbGRzKGluc3RhbmNlLCBSZWZsZWN0Lm93bktleXMoaW5zdGFuY2UpKTtcblx0cmVjb3JkLmZpbmFsaXplZCA9IHRydWU7XG59O1xuXG4vKipcbiAqIFBhcnRpYWwgZmluYWxpemF0aW9uOiByZS1lc3RhYmxpc2ggb25seSB0aGUgbGlzdGVkIGZpZWxkcy5cbiAqIERvZXMgTk9UIHNldCB0aGUgZmluYWxpemVkIGZsYWcg4oCUIHRoYXQgZmxhZyBtZWFucyBhdXRvIG1vZGUgcmFuLFxuICogZXZlcnl0aGluZyBlbHNlIGlzIHRoZSB1c2VyJ3MgY2hvaWNlLlxuICovXG5leHBvcnQgY29uc3QgZmluYWxpemVCeSA9IChpbnN0YW5jZTogb2JqZWN0LCBmaWVsZHM6IChzdHJpbmcgfCBzeW1ib2wpW10pOiB2b2lkID0+IHtcblx0ZmluYWxpc2VGaWVsZHMoaW5zdGFuY2UsIGZpZWxkcyk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNGaW5hbGl6ZWQgPSAoaW5zdGFuY2U6IG9iamVjdCk6IGJvb2xlYW4gPT4ge1xuXHRjb25zdCByZWNvcmQgPSBjb25zdHJ1Y3Rpb25SZWNvcmRzLmdldChpbnN0YW5jZSk7XG5cdGNvbnN0IHJlc3VsdCA9IHJlY29yZCA/IHJlY29yZC5maW5hbGl6ZWQgOiBmYWxzZTtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogVHVybiBhIGd1YXJkZWQgZmllbGQgYmFjayBpbnRvIGEgcGxhaW4gdmFsdWUgcHJvcGVydHkuXG4gKiBBbGxvd2VkIG9ubHkgZm9yIGZpZWxkcyByZS1lc3RhYmxpc2hlZCBieSBmaW5hbGl6ZS9maW5hbGl6ZUJ5IOKAlFxuICogdGhleSBzdGF5IGNvbmZpZ3VyYWJsZSBieSBkZXNpZ24uIEZpZWxkcyBndWFyZGVkIHNpbmNlIGNvbnN0cnVjdGlvblxuICogYXJlIG5vbi1jb25maWd1cmFibGU6IHRoYXQgbG9jayBpcyB0aGUgZXNzZW50aWFsIGRlc2lnbiBvZiB0aGUgbGliLlxuICogUHJpbWl0aXZlcyBhcmUgcmVhZCBiYWNrIHZpYSAudmFsdWVPZigpOyBvYmplY3RzIGFyZSBwbGFjZWQgYXMtaXMuXG4gKi9cbmV4cG9ydCBjb25zdCB1bndyYXAgPSAoaW5zdGFuY2U6IG9iamVjdCwgZmllbGQ6IHN0cmluZyB8IHN5bWJvbCk6IHZvaWQgPT4ge1xuXHRjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaW5zdGFuY2UsIGZpZWxkKTtcblx0aWYgKCFkZXNjcmlwdG9yIHx8ICFkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSB8fCB0eXBlb2YgZGVzY3JpcHRvci5nZXQgIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKEVycm9yc05hbWVzLkZPUkJJRERFTl9VTldSQVApO1xuXHR9XG5cdGNvbnN0IGN1cnJlbnQgPSAoaW5zdGFuY2UgYXMgUmVjb3JkPFByb3BlcnR5S2V5LCB1bmtub3duPilbZmllbGRdO1xuXHRjb25zdCBjdXJyZW50VmFsdWVPZiA9IChjdXJyZW50IGFzIHsgdmFsdWVPZj86IHVua25vd24gfSk/LnZhbHVlT2Y7XG5cdGNvbnN0IHVud3JhcHBlZCA9IHR5cGVvZiBjdXJyZW50VmFsdWVPZiA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdD8gKGN1cnJlbnQgYXMgeyB2YWx1ZU9mOiAoKSA9PiB1bmtub3duIH0pLnZhbHVlT2YoKVxuXHRcdDogY3VycmVudDtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3RhbmNlLCBmaWVsZCwge1xuXHRcdHZhbHVlICAgICAgICA6IHVud3JhcHBlZCxcblx0XHR3cml0YWJsZSAgICAgOiB0cnVlLFxuXHRcdGVudW1lcmFibGUgICA6IHRydWUsXG5cdFx0Y29uZmlndXJhYmxlIDogdHJ1ZVxuXHR9KTtcbn07XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBzZXR1cENvbW1vbkpTKCkge1xuXHRpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybjtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCAnZXhwb3J0cycsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gQmFzZUNvbnN0cnVjdG9yUHJvdG90eXBlO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdCYXNlQ2xhc3MnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIEJhc2VDbGFzcztcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ0ZpZWxkQ29uc3RydWN0b3InLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIEZpZWxkQ29uc3RydWN0b3I7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdTeW1ib2xJbml0aWFsVmFsdWUnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIFN5bWJvbEluaXRpYWxWYWx1ZTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ1N5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIFN5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2U7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdiYXNlVGFyZ2V0Jywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBiYXNlVGFyZ2V0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnU3RyaWN0Jywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBzdHJpY3Q7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdnZXRDb25zdHJ1Y3RlZEZpZWxkcycsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gZ2V0Q29uc3RydWN0ZWRGaWVsZHM7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdmaW5hbGl6ZScsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gZmluYWxpemU7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdmaW5hbGl6ZUJ5Jywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBmaW5hbGl6ZUJ5O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnaXNGaW5hbGl6ZWQnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIGlzRmluYWxpemVkO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAndW53cmFwJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiB1bndyYXA7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xufVxuXG5zZXR1cENvbW1vbkpTKCk7XG5cbk9iamVjdC5mcmVlemUoQmFzZUNvbnN0cnVjdG9yUHJvdG90eXBlKTtcbk9iamVjdC5mcmVlemUoQmFzZUNvbnN0cnVjdG9yUHJvdG90eXBlLnByb3RvdHlwZSk7XG4iXX0=