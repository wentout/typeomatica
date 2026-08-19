// oxlint-disable typescript/no-this-alias
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrap = exports.isFinalized = exports.finalizeBy = exports.finalize = exports.getConstructedFields = exports.Strict = exports.FieldConstructor = exports.SymbolInitialValue = exports.BaseClass = exports.BaseConstructorPrototype = exports.SymbolTypeomaticaProxyReference = exports.baseTarget = void 0;
const util_1 = require("util");
const errors_js_1 = require("./errors.js");
const index_js_1 = require("./types/index.js");
const fields_js_1 = require("./fields.js");
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
        primitives: index_js_1.primitives,
        special: index_js_1.special,
        nullish: index_js_1.nullish,
        objects: index_js_1.objects,
        functions: index_js_1.functions
    }).reduce((obj, [key, _handler]) => {
        // @ts-ignore
        obj[key] = function (initialValue, receiver) {
            const handler = _handler(initialValue);
            return {
                get() {
                    const invocationThis = this;
                    if (strictAccessCheck && invocationThis !== receiver) {
                        throw new ReferenceError(errors_js_1.ErrorsNames.ACCESS_DENIED);
                    }
                    const result = handler.get();
                    return result;
                },
                set(replacementValue) {
                    const invocationThis = this;
                    if (strictAccessCheck && invocationThis !== receiver) {
                        throw new ReferenceError(errors_js_1.ErrorsNames.ACCESS_DENIED);
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
    const valueIsPrimitive = (0, index_js_1.isPrimitive)(initialValue);
    const isObject = typeof initialValue === 'object';
    const isFunction = initialValue instanceof Function;
    const isNull = initialValue === null;
    /**
     * special: undefined or BigInt or Symbol
     * 	or other non constructible type
     */
    const types = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
    const resolver = createResolver(options);
    const descriptor = (isObject && (value instanceof fields_js_1.FieldConstructor)) ?
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
const hasNodeInspect = (util_1.inspect && util_1.inspect.custom);
// oxlint-disable-next-line no-unused-expressions
(hasNodeInspect && (props2skip.add(util_1.inspect.custom)));
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
const baseTarget = (_proto) => {
    const proto = typeof _proto === 'object' ? _proto : null;
    const answer = Object.create(proto);
    return answer;
};
exports.baseTarget = baseTarget;
exports.SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target, options) => {
    const target = Object.create(_target);
    const id = `TypeØmaticaProxyReference-${Math.random()}`;
    Object.defineProperty(target, exports.SymbolTypeomaticaProxyReference, {
        get() {
            return id;
        }
    });
    const handlers = createHandlers(options);
    const proxy = new Proxy(target, handlers);
    return proxy;
};
exports.BaseConstructorPrototype = function (_target, options) {
    if (!new.target) {
        const self = exports.BaseConstructorPrototype.bind(this, _target, options);
        self.prototype = {
            constructor: exports.BaseConstructorPrototype
        };
        // @ts-ignore
        return self;
    }
    // @ts-ignore
    if (this[exports.SymbolTypeomaticaProxyReference]) {
        // @ts-ignore
        return this;
    }
    const target = (0, exports.baseTarget)(_target);
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
        if (exports.BaseConstructorPrototype.prototype === protoPointer) {
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
    } while (protoConstrcutor !== exports.BaseConstructorPrototype);
    if (!constructors && protoConstrcutor !== exports.BaseConstructorPrototype) {
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
    const firstIsProxy = first !== null && !!Reflect.getOwnPropertyDescriptor(first, exports.SymbolTypeomaticaProxyReference);
    if (firstIsProxy) {
        Object.freeze(BaseClass.prototype);
        return;
    }
    let p = first;
    while (p !== null && p !== BaseClass.prototype && p !== Object.prototype) {
        const next = Object.getPrototypeOf(p);
        const nextIsProxy = next !== null && !!Reflect.getOwnPropertyDescriptor(next, exports.SymbolTypeomaticaProxyReference);
        Object.freeze(p);
        if (nextIsProxy) {
            break;
        }
        p = next;
    }
    Object.freeze(BaseClass.prototype);
};
class BaseClass {
    constructor(_target, options) {
        const { frozenPrototypes: freezeProtos = true } = options || {};
        // @ts-ignore
        if (this[exports.SymbolTypeomaticaProxyReference]) {
            freezeClassPrototypes(this, freezeProtos);
            return this;
        }
        const target = (0, exports.baseTarget)(_target);
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
exports.BaseClass = BaseClass;
const strict = function (_target, options) {
    const { frozenPrototypes: freezeProtos = true } = options || {};
    const decorator = function (cstr) {
        // @ts-ignore
        if (cstr.prototype[exports.SymbolTypeomaticaProxyReference]) {
            return cstr;
        }
        const target = (0, exports.baseTarget)(_target);
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
exports.SymbolInitialValue = fields_js_1.FieldConstructor.SymbolInitialValue;
const FieldConstructorExport = fields_js_1.FieldConstructor;
exports.FieldConstructor = FieldConstructorExport;
exports.Strict = strict;
/**
 * Fields that certainly passed through the define machinery for this
 * instance. Returns a copy of the internal Set — safe for the caller
 * to mutate.
 */
const getConstructedFields = (instance) => {
    const record = constructionRecords.get(instance);
    const result = record ? new Set(record.fields) : new Set();
    return result;
};
exports.getConstructedFields = getConstructedFields;
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
const finalize = (instance) => {
    const record = ensureRecord(instance);
    finaliseFields(instance, Reflect.ownKeys(instance));
    record.finalized = true;
};
exports.finalize = finalize;
/**
 * Partial finalization: re-establish only the listed fields.
 * Does NOT set the finalized flag — that flag means auto mode ran,
 * everything else is the user's choice.
 */
const finalizeBy = (instance, fields) => {
    finaliseFields(instance, fields);
};
exports.finalizeBy = finalizeBy;
const isFinalized = (instance) => {
    const record = constructionRecords.get(instance);
    const result = record ? record.finalized : false;
    return result;
};
exports.isFinalized = isFinalized;
/**
 * Turn a guarded field back into a plain value property.
 * Allowed only for fields re-established by finalize/finalizeBy —
 * they stay configurable by design. Fields guarded since construction
 * are non-configurable: that lock is the essential design of the lib.
 * Primitives are read back via .valueOf(); objects are placed as-is.
 */
const unwrap = (instance, field) => {
    const descriptor = Reflect.getOwnPropertyDescriptor(instance, field);
    if (!descriptor || !descriptor.configurable || typeof descriptor.get !== 'function') {
        throw new TypeError(errors_js_1.ErrorsNames.FORBIDDEN_UNWRAP);
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
exports.unwrap = unwrap;
/* istanbul ignore next */
function setupCommonJS() {
    if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
        return;
    }
    Object.defineProperty(module, 'exports', {
        get() {
            return exports.BaseConstructorPrototype;
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
            return fields_js_1.FieldConstructor;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'SymbolInitialValue', {
        get() {
            return exports.SymbolInitialValue;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'SymbolTypeomaticaProxyReference', {
        get() {
            return exports.SymbolTypeomaticaProxyReference;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'baseTarget', {
        get() {
            return exports.baseTarget;
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
            return exports.getConstructedFields;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'finalize', {
        get() {
            return exports.finalize;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'finalizeBy', {
        get() {
            return exports.finalizeBy;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'isFinalized', {
        get() {
            return exports.isFinalized;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'unwrap', {
        get() {
            return exports.unwrap;
        },
        enumerable: true
    });
}
setupCommonJS();
Object.freeze(exports.BaseConstructorPrototype);
Object.freeze(exports.BaseConstructorPrototype.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMENBQTBDO0FBRTFDLFlBQVksQ0FBQzs7O0FBRWIsK0JBQStCO0FBQy9CLDJDQUEwQztBQUUxQywrQ0FPMEI7QUFFMUIsMkNBQStDO0FBYS9DLGlFQUFpRTtBQUNqRSxtRUFBbUU7QUFDbkUsbUVBQW1FO0FBQ25FLDZEQUE2RDtBQUM3RCxNQUFNLG1CQUFtQixHQUFHLElBQUksT0FBTyxFQUE4QixDQUFDO0FBRXRFLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBZ0IsRUFBc0IsRUFBRTtJQUM3RCxJQUFJLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2IsTUFBTSxHQUFHO1lBQ1IsTUFBTSxFQUFNLElBQUksR0FBRyxFQUFFO1lBQ3JCLE9BQU8sRUFBSyxTQUFTO1lBQ3JCLFNBQVMsRUFBRyxLQUFLO1NBQ2pCLENBQUM7UUFDRixtQkFBbUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLENBQUMsVUFBOEIsRUFBRSxFQUFFLEVBQUU7SUFDM0QsTUFBTSxFQUFFLGlCQUFpQixHQUFHLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU5QyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDckIsVUFBVSxFQUFWLHFCQUFVO1FBQ1YsT0FBTyxFQUFQLGtCQUFPO1FBQ1AsT0FBTyxFQUFQLGtCQUFPO1FBQ1AsT0FBTyxFQUFQLGtCQUFPO1FBQ1AsU0FBUyxFQUFULG9CQUFTO0tBQ1QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFO1FBQzFDLGFBQWE7UUFDYixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxZQUFvQixFQUFFLFFBQWdCO1lBQzFELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN2QyxPQUFPO2dCQUNOLEdBQUc7b0JBQ0YsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDO29CQUM1QixJQUFJLGlCQUFpQixJQUFJLGNBQWMsS0FBSyxRQUFRLEVBQUUsQ0FBQzt3QkFDdEQsTUFBTSxJQUFJLGNBQWMsQ0FBQyx1QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNyRCxDQUFDO29CQUNELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDN0IsT0FBTyxNQUFNLENBQUM7Z0JBQ2YsQ0FBQztnQkFDRCxHQUFHLENBQUMsZ0JBQXlCO29CQUM1QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksaUJBQWlCLElBQUksY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO3dCQUN0RCxNQUFNLElBQUksY0FBYyxDQUFDLHVCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3JELENBQUM7b0JBQ0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUM3QyxPQUFPLE1BQU0sQ0FBQztnQkFDZixDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVGLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFDO0FBRUYsTUFBTSxjQUFjLEdBQUcsQ0FBQyxRQUF5QixFQUFFLFlBQXFCLEVBQUUsUUFBZ0IsRUFBRSxPQUE0QixFQUFFLFlBQVksR0FBRyxLQUFLLEVBQUUsRUFBRTtJQUVqSixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7SUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLHNCQUFXLEVBQUMsWUFBWSxDQUFDLENBQUM7SUFDbkQsTUFBTSxRQUFRLEdBQUcsT0FBTyxZQUFZLEtBQUssUUFBUSxDQUFDO0lBQ2xELE1BQU0sVUFBVSxHQUFHLFlBQVksWUFBWSxRQUFRLENBQUM7SUFDcEQsTUFBTSxNQUFNLEdBQUcsWUFBWSxLQUFLLElBQUksQ0FBQztJQUVyQzs7O09BR0c7SUFFSCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUMvQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQ1YsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDOUIsQ0FBQyxDQUFDLENBQUMsQ0FDSCxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUNwQyxDQUNELENBQUM7SUFFRixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFekMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxLQUFLLFlBQVksNEJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNQLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFlBQVk7UUFDWixhQUFhO1FBQ2IsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztLQUNuQyxDQUFDO0lBRUgsMkNBQTJDO0lBQzNDLGVBQWU7SUFDZixhQUFhO0lBQ2IsSUFBSTtJQUVKLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUV0RSxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFFekIsT0FBTyxNQUFNLENBQUM7QUFFZixDQUFDLENBQUM7QUFFRiw4REFBOEQ7QUFDOUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDMUIsTUFBTSxDQUFDLFdBQVc7SUFDbEIsTUFBTSxDQUFDLFFBQVE7SUFDZixzQkFBc0I7SUFDdEIsVUFBVTtJQUNWLFNBQVM7SUFDVCxNQUFNO0NBQ04sQ0FBQyxDQUFDO0FBQ0gscUVBQXFFO0FBQ3JFLE1BQU0sY0FBYyxHQUFHLENBQUMsY0FBTyxJQUFJLGNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRCxpREFBaUQ7QUFDakQsQ0FBQyxjQUFjLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFckQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxPQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELEdBQUcsQ0FBQyxNQUFjLEVBQUUsSUFBcUIsRUFBRSxRQUFnQjtRQUMxRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDMUIsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdkIsMENBQTBDO1lBQzFDLE9BQU87Z0JBQ04sTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtvQkFDMUQsYUFBYTtvQkFDYixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUMzQixPQUFPLEdBQUcsQ0FBQztnQkFDWixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNULENBQUMsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLElBQUksS0FBSyxhQUFhLEVBQUUsQ0FBQztZQUM1QixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFDdEMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxJQUFJLDBCQUEwQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQztZQUM1RSxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBQ0QsaUdBQWlHO1FBQ2pHLGlDQUFpQztJQUNsQyxDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQVMsRUFBRSxJQUFZLEVBQUUsS0FBYyxFQUFFLFFBQWdCO1FBQzVELE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFDRCxjQUFjO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDRCxvRUFBb0U7SUFDcEUsY0FBYztRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUMzRCxtREFBbUQ7SUFDcEQsQ0FBQztJQUNELGNBQWM7UUFDYixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUNELHFCQUFxQjtJQUNyQixhQUFhO0lBQ2Isd0RBQXdEO0lBQ3hELEtBQUs7Q0FDTCxDQUFDLENBQUM7QUFFSCwwQ0FBMEM7QUFDbkMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFlLEVBQUUsRUFBRTtJQUM3QyxNQUFNLEtBQUssR0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3pELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDLENBQUM7QUFKVyxRQUFBLFVBQVUsY0FJckI7QUFFVyxRQUFBLCtCQUErQixHQUFHLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ25GLE1BQU0sNEJBQTRCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsT0FBNEIsRUFBRSxFQUFFO0lBQ3RGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsTUFBTSxFQUFFLEdBQUcsNkJBQTZCLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO0lBQ3hELE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLHVDQUErQixFQUFFO1FBQzlELEdBQUc7WUFDRixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRCxDQUFDLENBQUM7SUFDSCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBR1csUUFBQSx3QkFBd0IsR0FBRyxVQUFxRSxPQUFXLEVBQUUsT0FBNEI7SUFDckosSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVqQixNQUFNLElBQUksR0FLTixnQ0FBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2hCLFdBQVcsRUFBRSxnQ0FBd0I7U0FDckMsQ0FBQztRQUVGLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQztJQUViLENBQUM7SUFFRCxhQUFhO0lBQ2IsSUFBSSxJQUFJLENBQUMsdUNBQStCLENBQUMsRUFBRSxDQUFDO1FBQzNDLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFVLEVBQUMsT0FBTyxDQUFXLENBQUM7SUFDN0MsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFlBQVksR0FBRyxJQUFJLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0lBRWhFLE1BQU0saUJBQWlCLEdBQUcsNEJBQTRCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXhFLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFXLENBQUM7SUFFN0QsSUFBSSxLQUFLLENBQUM7SUFDVixJQUFJLFlBQVksR0FBRyxJQUFjLENBQUM7SUFDbEMsSUFBSSxnQkFBZ0IsQ0FBQztJQUVyQixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7SUFFekIsYUFBYTtJQUNiLGlHQUFpRztJQUNqRywyQkFBMkI7SUFDM0IseUdBQXlHO0lBQ3pHLElBQUk7SUFFSixHQUFHLENBQUM7UUFDSCxLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQ3JCLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksZ0NBQXdCLENBQUMsU0FBUyxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQ3pELFlBQVksR0FBRyxJQUFJLENBQUM7WUFDcEIsTUFBTTtRQUNQLENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWTtZQUFFLE1BQU07UUFDekIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsVUFBVTtZQUFFLFNBQVM7UUFDMUIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQ2pELHdCQUF3QjtRQUN4QixnQkFBZ0IsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQyxRQUFRLGdCQUFnQixLQUFLLGdDQUF3QixFQUFFO0lBRXhELElBQUksQ0FBQyxZQUFZLElBQUksZ0JBQWdCLEtBQUssZ0NBQXdCLEVBQUUsQ0FBQztRQUNwRSxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDaEQsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNsQixNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFDRCxhQUFhO0lBQ2IsT0FBTyxJQUFJLENBQUM7SUFFYixtQ0FBbUM7QUFDbkMsQ0FHQyxDQUFDO0FBQ0Ysa0NBQWtDO0FBRWxDLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxRQUFnQixFQUFFLFlBQXFCLEVBQUUsRUFBRTtJQUN6RSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbkIsT0FBTztJQUNSLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sWUFBWSxHQUFHLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsdUNBQStCLENBQUMsQ0FBQztJQUNsSCxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLE9BQU87SUFDUixDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ2QsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxTQUFTLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDMUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLHVDQUErQixDQUFDLENBQUM7UUFDL0csTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2pCLE1BQU07UUFDUCxDQUFDO1FBQ0QsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNWLENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUM7QUFFRixNQUFhLFNBQVM7SUFDckIsWUFBWSxPQUFnQixFQUFFLE9BQTRCO1FBQ3pELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEdBQUcsSUFBSSxFQUFFLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUVoRSxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsdUNBQStCLENBQUMsRUFBRSxDQUFDO1lBQzNDLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFVLEVBQUMsT0FBTyxDQUFXLENBQUM7UUFDN0MsTUFBTSxLQUFLLEdBQUcsNEJBQTRCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEQsSUFBSSxhQUFhLEtBQUssU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25DLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxJQUFJLFVBQVUsR0FBRyxhQUFhLENBQUM7UUFDL0IsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwRCxPQUFPLFdBQVcsS0FBSyxTQUFTLENBQUMsU0FBUyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNwRSxVQUFVLEdBQUcsV0FBVyxDQUFDO1lBQ3pCLFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNEO0FBOUJELDhCQThCQztBQUdELE1BQU0sTUFBTSxHQUFHLFVBQVUsT0FBZ0IsRUFBRSxPQUE0QjtJQUN0RSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFFaEUsTUFBTSxTQUFTLEdBQUcsVUFBWSxJQUFPO1FBRXBDLGFBQWE7UUFDYixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsdUNBQStCLENBQUMsRUFBRSxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLElBQUEsa0JBQVUsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV2QyxhQUFhO1FBQ2IsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksWUFBWSxFQUFFLENBQUM7WUFDbEIsYUFBYTtZQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztRQUdaLHlDQUF5QztRQUN6Qyw0Q0FBNEM7UUFDNUMsY0FBYztRQUNkLHdDQUF3QztRQUN4Qyx3REFBd0Q7UUFDeEQsNENBQTRDO1FBRTVDLG1DQUFtQztRQUVuQyxnRUFBZ0U7UUFDaEUsMkJBQTJCO1FBRTNCLGtEQUFrRDtRQUVsRCxrRUFBa0U7UUFDbEUsaURBQWlEO1FBRWpELCtDQUErQztRQUMvQyw0Q0FBNEM7UUFHNUMsa0RBQWtEO1FBQ2xELHNFQUFzRTtRQUV0RSxjQUFjO1FBQ2QsbURBQW1EO1FBQ25ELGNBQWM7UUFFZCxtQkFBbUI7UUFDbkIsTUFBTTtRQUNOLE1BQU07UUFDTix1QkFBdUI7SUFDeEIsQ0FBQyxDQUFDO0lBRUYsT0FBTyxTQUFTLENBQUM7QUFFbEIsQ0FBQyxDQUFDO0FBQ2EsMEJBQWtCLEdBQUssNEJBQWdCLG9CQUFDO0FBQ3ZELE1BQU0sc0JBQXNCLEdBQUcsNEJBQWdCLENBQUM7QUFDYixrREFBZ0I7QUFDdEMsUUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBRTdCOzs7O0dBSUc7QUFDSSxNQUFNLG9CQUFvQixHQUFHLENBQUMsUUFBZ0IsRUFBd0IsRUFBRTtJQUM5RSxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFtQixDQUFDO0lBQzVFLE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBSlcsUUFBQSxvQkFBb0Isd0JBSS9CO0FBRUYsTUFBTSxjQUFjLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEtBQTBCLEVBQVEsRUFBRTtJQUM3RSxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3RCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM3Qix1Q0FBdUM7WUFDdkMsT0FBTztRQUNSLENBQUM7UUFDRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzdDLHNEQUFzRDtZQUN0RCxPQUFPO1FBQ1IsQ0FBQztRQUNELE9BQVEsUUFBeUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxpRUFBaUU7UUFDakUsc0RBQXNEO1FBQ3RELGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4RSxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0ksTUFBTSxRQUFRLEdBQUcsQ0FBQyxRQUFnQixFQUFRLEVBQUU7SUFDbEQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQUpXLFFBQUEsUUFBUSxZQUluQjtBQUVGOzs7O0dBSUc7QUFDSSxNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQWdCLEVBQUUsTUFBMkIsRUFBUSxFQUFFO0lBQ2pGLGNBQWMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDO0FBRlcsUUFBQSxVQUFVLGNBRXJCO0FBRUssTUFBTSxXQUFXLEdBQUcsQ0FBQyxRQUFnQixFQUFXLEVBQUU7SUFDeEQsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2pELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBSlcsUUFBQSxXQUFXLGVBSXRCO0FBRUY7Ozs7OztHQU1HO0FBQ0ksTUFBTSxNQUFNLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEtBQXNCLEVBQVEsRUFBRTtJQUN4RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JFLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxJQUFJLE9BQU8sVUFBVSxDQUFDLEdBQUcsS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNyRixNQUFNLElBQUksU0FBUyxDQUFDLHVCQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBQ0QsTUFBTSxPQUFPLEdBQUksUUFBeUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRSxNQUFNLGNBQWMsR0FBSSxPQUFpQyxFQUFFLE9BQU8sQ0FBQztJQUNuRSxNQUFNLFNBQVMsR0FBRyxPQUFPLGNBQWMsS0FBSyxVQUFVO1FBQ3JELENBQUMsQ0FBRSxPQUFzQyxDQUFDLE9BQU8sRUFBRTtRQUNuRCxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ1gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFO1FBQ3RDLEtBQUssRUFBVSxTQUFTO1FBQ3hCLFFBQVEsRUFBTyxJQUFJO1FBQ25CLFVBQVUsRUFBSyxJQUFJO1FBQ25CLFlBQVksRUFBRyxJQUFJO0tBQ25CLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQztBQWhCVyxRQUFBLE1BQU0sVUFnQmpCO0FBRUYsMEJBQTBCO0FBQzFCLFNBQVMsYUFBYTtJQUNyQixJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDNUUsT0FBTztJQUNSLENBQUM7SUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7UUFDeEMsR0FBRztZQUNGLE9BQU8sZ0NBQXdCLENBQUM7UUFDakMsQ0FBQztRQUNELFVBQVUsRUFBRSxJQUFJO0tBQ2hCLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUU7UUFDbEQsR0FBRztZQUNGLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxVQUFVLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUU7UUFDekQsR0FBRztZQUNGLE9BQU8sNEJBQWdCLENBQUM7UUFDekIsQ0FBQztRQUNELFVBQVUsRUFBRSxJQUFJO0tBQ2hCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRTtRQUMzRCxHQUFHO1lBQ0YsT0FBTywwQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBQ0QsVUFBVSxFQUFFLElBQUk7S0FDaEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGlDQUFpQyxFQUFFO1FBQ3hFLEdBQUc7WUFDRixPQUFPLHVDQUErQixDQUFDO1FBQ3hDLENBQUM7UUFDRCxVQUFVLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFO1FBQ25ELEdBQUc7WUFDRixPQUFPLGtCQUFVLENBQUM7UUFDbkIsQ0FBQztRQUNELFVBQVUsRUFBRSxJQUFJO0tBQ2hCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7UUFDL0MsR0FBRztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUNELFVBQVUsRUFBRSxJQUFJO0tBQ2hCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRTtRQUM3RCxHQUFHO1lBQ0YsT0FBTyw0QkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBQ0QsVUFBVSxFQUFFLElBQUk7S0FDaEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtRQUNqRCxHQUFHO1lBQ0YsT0FBTyxnQkFBUSxDQUFDO1FBQ2pCLENBQUM7UUFDRCxVQUFVLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFO1FBQ25ELEdBQUc7WUFDRixPQUFPLGtCQUFVLENBQUM7UUFDbkIsQ0FBQztRQUNELFVBQVUsRUFBRSxJQUFJO0tBQ2hCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUU7UUFDcEQsR0FBRztZQUNGLE9BQU8sbUJBQVcsQ0FBQztRQUNwQixDQUFDO1FBQ0QsVUFBVSxFQUFFLElBQUk7S0FDaEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtRQUMvQyxHQUFHO1lBQ0YsT0FBTyxjQUFNLENBQUM7UUFDZixDQUFDO1FBQ0QsVUFBVSxFQUFFLElBQUk7S0FDaEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELGFBQWEsRUFBRSxDQUFDO0FBRWhCLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0NBQXdCLENBQUMsQ0FBQztBQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLGdDQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gb3hsaW50LWRpc2FibGUgdHlwZXNjcmlwdC9uby10aGlzLWFsaWFzXG4gXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGluc3BlY3QgfSBmcm9tICd1dGlsJztcbmltcG9ydCB7IEVycm9yc05hbWVzIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuXG5pbXBvcnQge1xuXHRmdW5jdGlvbnMsXG5cdG51bGxpc2gsXG5cdG9iamVjdHMsXG5cdHByaW1pdGl2ZXMsXG5cdHNwZWNpYWwsXG5cdGlzUHJpbWl0aXZlXG59IGZyb20gJy4vdHlwZXMvaW5kZXguanMnO1xuXG5pbXBvcnQgeyBGaWVsZENvbnN0cnVjdG9yIH0gZnJvbSAnLi9maWVsZHMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVvbWF0aWNhT3B0aW9ucyB7XG5cdHN0cmljdEFjY2Vzc0NoZWNrPzogYm9vbGVhbjtcblx0ZnJvemVuUHJvdG90eXBlcz86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBDb25zdHJ1Y3Rpb25SZWNvcmQge1xuXHRmaWVsZHMgICAgOiBTZXQ8c3RyaW5nIHwgc3ltYm9sPjtcblx0b3B0aW9ucyAgIDogVHlwZW9tYXRpY2FPcHRpb25zIHwgdW5kZWZpbmVkO1xuXHRmaW5hbGl6ZWQgOiBib29sZWFuO1xufVxuXG4vLyBGaWVsZHMgdGhhdCBwYXNzZWQgdGhyb3VnaCB0aGUgZGVmaW5lIG1hY2hpbmVyeSwgcGVyIGluc3RhbmNlLlxuLy8gVGhlIHBvc3RDb25zdHJ1Y3Rpb24gY29tcGFyYXRvciAoVGh1bmRlcnN0cnVjayBkZXNpZ24pIGRpZmZzIHRoZVxuLy8gaW5zdGFuY2UncyBvd24gZGVzY3JpcHRvcnMgYWdhaW5zdCB0aGlzIFNldCB0byBmaW5kIGZpZWxkcyBhZGRlZFxuLy8gaGlkZGVubHkg4oCUIGNsYXNzIGZpZWxkcyBhbmQgb3RoZXIgZGVmaW5lLXNlbWFudGljcyB3cml0ZXMuXG5jb25zdCBjb25zdHJ1Y3Rpb25SZWNvcmRzID0gbmV3IFdlYWtNYXA8b2JqZWN0LCBDb25zdHJ1Y3Rpb25SZWNvcmQ+KCk7XG5cbmNvbnN0IGVuc3VyZVJlY29yZCA9IChpbnN0YW5jZTogb2JqZWN0KTogQ29uc3RydWN0aW9uUmVjb3JkID0+IHtcblx0bGV0IHJlY29yZCA9IGNvbnN0cnVjdGlvblJlY29yZHMuZ2V0KGluc3RhbmNlKTtcblx0aWYgKCFyZWNvcmQpIHtcblx0XHRyZWNvcmQgPSB7XG5cdFx0XHRmaWVsZHMgICAgOiBuZXcgU2V0KCksXG5cdFx0XHRvcHRpb25zICAgOiB1bmRlZmluZWQsXG5cdFx0XHRmaW5hbGl6ZWQgOiBmYWxzZVxuXHRcdH07XG5cdFx0Y29uc3RydWN0aW9uUmVjb3Jkcy5zZXQoaW5zdGFuY2UsIHJlY29yZCk7XG5cdH1cblx0cmV0dXJuIHJlY29yZDtcbn07XG5cbmNvbnN0IGNyZWF0ZVJlc29sdmVyID0gKG9wdGlvbnM6IFR5cGVvbWF0aWNhT3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IHsgc3RyaWN0QWNjZXNzQ2hlY2sgPSBmYWxzZSB9ID0gb3B0aW9ucztcblx0XG5cdHJldHVybiBPYmplY3QuZW50cmllcyh7XG5cdFx0cHJpbWl0aXZlcyxcblx0XHRzcGVjaWFsLFxuXHRcdG51bGxpc2gsXG5cdFx0b2JqZWN0cyxcblx0XHRmdW5jdGlvbnNcblx0fSkucmVkdWNlKChvYmo6IG9iamVjdCwgW2tleSwgX2hhbmRsZXJdKSA9PiB7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG9ialtrZXldID0gZnVuY3Rpb24gKGluaXRpYWxWYWx1ZTogb2JqZWN0LCByZWNlaXZlcjogb2JqZWN0KSB7XG5cdFx0XHRjb25zdCBoYW5kbGVyID0gX2hhbmRsZXIoaW5pdGlhbFZhbHVlKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGdldCgpIHtcblx0XHRcdFx0XHRjb25zdCBpbnZvY2F0aW9uVGhpcyA9IHRoaXM7XG5cdFx0XHRcdFx0aWYgKHN0cmljdEFjY2Vzc0NoZWNrICYmIGludm9jYXRpb25UaGlzICE9PSByZWNlaXZlcikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKEVycm9yc05hbWVzLkFDQ0VTU19ERU5JRUQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSBoYW5kbGVyLmdldCgpO1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldChyZXBsYWNlbWVudFZhbHVlOiB1bmtub3duKSB7XG5cdFx0XHRcdFx0Y29uc3QgaW52b2NhdGlvblRoaXMgPSB0aGlzO1xuXHRcdFx0XHRcdGlmIChzdHJpY3RBY2Nlc3NDaGVjayAmJiBpbnZvY2F0aW9uVGhpcyAhPT0gcmVjZWl2ZXIpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihFcnJvcnNOYW1lcy5BQ0NFU1NfREVOSUVEKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gaGFuZGxlci5zZXQocmVwbGFjZW1lbnRWYWx1ZSk7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIG9iajtcblx0fSwge30pO1xufTtcblxuY29uc3QgY3JlYXRlUHJvcGVydHkgPSAocHJvcE5hbWU6IHN0cmluZyB8IHN5bWJvbCwgaW5pdGlhbFZhbHVlOiB1bmtub3duLCByZWNlaXZlcjogb2JqZWN0LCBvcHRpb25zPzogVHlwZW9tYXRpY2FPcHRpb25zLCBjb25maWd1cmFibGUgPSBmYWxzZSkgPT4ge1xuXG5cdGNvbnN0IHZhbHVlID0gaW5pdGlhbFZhbHVlO1xuXHRjb25zdCB2YWx1ZUlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmUoaW5pdGlhbFZhbHVlKTtcblx0Y29uc3QgaXNPYmplY3QgPSB0eXBlb2YgaW5pdGlhbFZhbHVlID09PSAnb2JqZWN0Jztcblx0Y29uc3QgaXNGdW5jdGlvbiA9IGluaXRpYWxWYWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xuXHRjb25zdCBpc051bGwgPSBpbml0aWFsVmFsdWUgPT09IG51bGw7XG5cblx0LyoqXG5cdCAqIHNwZWNpYWw6IHVuZGVmaW5lZCBvciBCaWdJbnQgb3IgU3ltYm9sXG5cdCAqIFx0b3Igb3RoZXIgbm9uIGNvbnN0cnVjdGlibGUgdHlwZVxuXHQgKi9cblxuXHRjb25zdCB0eXBlcyA9IHZhbHVlSXNQcmltaXRpdmUgPyAncHJpbWl0aXZlcycgOiAoXG5cdFx0aXNPYmplY3QgPyAoXG5cdFx0XHRpc051bGwgPyAnbnVsbGlzaCcgOiAnb2JqZWN0cydcblx0XHQpIDogKFxuXHRcdFx0aXNGdW5jdGlvbiA/ICdmdW5jdGlvbnMnIDogJ3NwZWNpYWwnXG5cdFx0KVxuXHQpO1xuXG5cdGNvbnN0IHJlc29sdmVyID0gY3JlYXRlUmVzb2x2ZXIob3B0aW9ucyk7XG5cblx0Y29uc3QgZGVzY3JpcHRvciA9IChpc09iamVjdCAmJiAodmFsdWUgaW5zdGFuY2VvZiBGaWVsZENvbnN0cnVjdG9yKSkgP1xuXHRcdHZhbHVlIDoge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGNvbmZpZ3VyYWJsZSxcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdC4uLnJlc29sdmVyW3R5cGVzXSh2YWx1ZSwgcmVjZWl2ZXIpLFxuXHRcdH07XG5cblx0Ly8gaWYgKHZhbHVlIGluc3RhbmNlb2YgRmllbGRDb25zdHJ1Y3Rvcikge1xuXHQvLyBcdGRlc2NyaXB0b3I7XG5cdC8vIFx0ZGVidWdnZXI7XG5cdC8vIH1cblxuXHRjb25zdCByZXN1bHQgPSBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHJlY2VpdmVyLCBwcm9wTmFtZSwgZGVzY3JpcHRvcik7XG5cblx0Y29uc3QgcmVjb3JkID0gZW5zdXJlUmVjb3JkKHJlY2VpdmVyKTtcblx0cmVjb3JkLmZpZWxkcy5hZGQocHJvcE5hbWUpO1xuXHRyZWNvcmQub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0cmV0dXJuIHJlc3VsdDtcblxufTtcblxuLy8gbGluZSBiZWxvdyAnaHJlZicgaXMgZm9yIHV0aWwuaW5zcGVjdCB3b3JrcywgdXNlZnVsIGZvciB2MjRcbmNvbnN0IHByb3BzMnNraXAgPSBuZXcgU2V0KFtcblx0U3ltYm9sLnRvU3RyaW5nVGFnLFxuXHRTeW1ib2wuaXRlcmF0b3IsXG5cdC8vIFN5bWJvbC50b1ByaW1pdGl2ZSxcblx0J3RvU3RyaW5nJyxcblx0J3ZhbHVlT2YnLFxuXHQnaHJlZidcbl0pO1xuLy8gY29uc3QgcHJvcHMyc2tpcCA9IG5ldyBTZXQoW1N5bWJvbC50b1N0cmluZ1RhZywgU3ltYm9sLml0ZXJhdG9yXSk7XG5jb25zdCBoYXNOb2RlSW5zcGVjdCA9IChpbnNwZWN0ICYmIGluc3BlY3QuY3VzdG9tKTtcbi8vIG94bGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbihoYXNOb2RlSW5zcGVjdCAmJiAocHJvcHMyc2tpcC5hZGQoaW5zcGVjdC5jdXN0b20pKSk7XG5cbmNvbnN0IGNyZWF0ZUhhbmRsZXJzID0gKG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpID0+ICh7XG5cdGdldCh0YXJnZXQ6IG9iamVjdCwgcHJvcDogc3RyaW5nIHwgc3ltYm9sLCByZWNlaXZlcjogb2JqZWN0KSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XG5cdFx0aWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpZiAocHJvcCA9PT0gJ3RvSlNPTicpIHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICh0aGlzOiB0eXBlb2YgdGFyZ2V0KSB7XG5cdFx0XHRcdGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzKTtcblx0XHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudHJpZXMucmVkdWNlKChvYmosIFtrZXksIHZhbHVlXSkgPT4ge1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvYmpba2V5XSA9IHZhbHVlLnZhbHVlT2YoKTtcblx0XHRcdFx0XHRyZXR1cm4gb2JqO1xuXHRcdFx0XHR9LCB7fSkpO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0aWYgKHByb3AgPT09ICdjb25zdHJ1Y3RvcicpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGNvbnN0IHsgbmFtZSB9ID0gcmVjZWl2ZXIuY29uc3RydWN0b3I7XG5cdFx0aWYgKHByb3BzMnNraXAuaGFzKHByb3ApKSB7XG5cdFx0XHRjb25zdCBtZXNzYWdlID0gYCR7bmFtZX0gbGFja3MgZGVmaW5pdGlvbiBvZiBbICR7U3RyaW5nKHByb3ApLnZhbHVlT2YoKX0gXWA7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZTtcblx0XHR9XG5cdFx0Ly8gY29uc3QgZXJyb3JNZXNzYWdlID0gYCR7RXJyb3JzTmFtZXMuTUlTU0lOR19QUk9QfTogWyAke1N0cmluZyhwcm9wKS52YWx1ZU9mKCl9IF0gZm9yICR7bmFtZX1gO1xuXHRcdC8vIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuXHR9LFxuXHRzZXQoXzogb2JqZWN0LCBwcm9wOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duLCByZWNlaXZlcjogb2JqZWN0KSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gY3JlYXRlUHJvcGVydHkocHJvcCwgdmFsdWUsIHJlY2VpdmVyLCBvcHRpb25zKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRzZXRQcm90b3R5cGVPZigpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1NldHRpbmcgcHJvdG90eXBlIGlzIG5vdCBhbGxvd2VkIScpO1xuXHR9LFxuXHQvLyBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQ6IG9iamVjdCwga2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IG9iamVjdCkge1xuXHRkZWZpbmVQcm9wZXJ0eSgpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0RlZmluaW5nIG5ldyBQcm9wZXJ0aWVzIGlzIG5vdCBhbGxvd2VkIScpO1xuXHRcdC8vIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIGRlc2NyaXB0b3IpO1xuXHR9LFxuXHRkZWxldGVQcm9wZXJ0eSgpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnRpZXMgRGVsZXRpb24gaXMgbm90IGFsbG93ZWQhJyk7XG5cdH0sXG5cdC8vIGdldFByb3RvdHlwZU9mKCkge1xuXHQvLyBcdGRlYnVnZ2VyO1xuXHQvLyBcdHRocm93IG5ldyBFcnJvcignR2V0dGluZyBwcm90b3R5cGUgaXMgbm90IGFsbG93ZWQnKTtcblx0Ly8gfSxcbn0pO1xuXG4vLyB1c2VyIGhhdmUgdG8gcHJlY2lzZWx5IGRlZmluZSBhbGwgcHJvcHNcbmV4cG9ydCBjb25zdCBiYXNlVGFyZ2V0ID0gKF9wcm90bz86IG9iamVjdCkgPT4ge1xuXHRjb25zdCBwcm90byA9IHR5cGVvZiBfcHJvdG8gPT09ICdvYmplY3QnID8gX3Byb3RvIDogbnVsbDtcblx0Y29uc3QgYW5zd2VyID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cdHJldHVybiBhbnN3ZXI7XG59O1xuXG5leHBvcnQgY29uc3QgU3ltYm9sVHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSA9IFN5bWJvbCgnVHlwZcOYbWF0aWNhUHJveHlSZWZlcmVuY2UnKTtcbmNvbnN0IGdldFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UgPSAoX3RhcmdldDogb2JqZWN0LCBvcHRpb25zPzogVHlwZW9tYXRpY2FPcHRpb25zKSA9PiB7XG5cdGNvbnN0IHRhcmdldCA9IE9iamVjdC5jcmVhdGUoX3RhcmdldCk7XG5cdGNvbnN0IGlkID0gYFR5cGXDmG1hdGljYVByb3h5UmVmZXJlbmNlLSR7TWF0aC5yYW5kb20oKX1gO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIGlkO1xuXHRcdH1cblx0fSk7XG5cdGNvbnN0IGhhbmRsZXJzID0gY3JlYXRlSGFuZGxlcnMob3B0aW9ucyk7XG5cdGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KHRhcmdldCwgaGFuZGxlcnMpO1xuXHRyZXR1cm4gcHJveHk7XG59O1xuXG5cbmV4cG9ydCBjb25zdCBCYXNlQ29uc3RydWN0b3JQcm90b3R5cGUgPSBmdW5jdGlvbiA8VCBleHRlbmRzIG9iamVjdCwgUyBleHRlbmRzIFQ+KHRoaXM6IFMgZXh0ZW5kcyBUID8gUyA6IHt9LCBfdGFyZ2V0PzogVCwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucyApOiBUIHtcblx0aWYgKCFuZXcudGFyZ2V0KSB7XG5cblx0XHRjb25zdCBzZWxmOiB7XG5cdFx0XHRwcm90b3R5cGU6IHtcblx0XHRcdFx0Y29uc3RydWN0b3I6IHR5cGVvZiBCYXNlQ29uc3RydWN0b3JQcm90b3R5cGVcblx0XHRcdH1cblx0XHRcdC8vQHRzLWlnbm9yZVxuXHRcdH0gPSBCYXNlQ29uc3RydWN0b3JQcm90b3R5cGUuYmluZCh0aGlzLCBfdGFyZ2V0LCBvcHRpb25zKTtcblxuXHRcdHNlbGYucHJvdG90eXBlID0ge1xuXHRcdFx0Y29uc3RydWN0b3I6IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZVxuXHRcdH07XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHNlbGY7XG5cblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0aWYgKHRoaXNbU3ltYm9sVHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZV0pIHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRjb25zdCB0YXJnZXQgPSBiYXNlVGFyZ2V0KF90YXJnZXQpIGFzIG9iamVjdDtcblx0Y29uc3QgeyBmcm96ZW5Qcm90b3R5cGVzOiBmcmVlemVQcm90b3MgPSB0cnVlIH0gPSBvcHRpb25zIHx8IHt9O1xuXG5cdGNvbnN0IEluc3RhbmNlUHJvdG90eXBlID0gZ2V0VHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSh0YXJnZXQsIG9wdGlvbnMpO1xuXG5cdGNvbnN0IGNsYXNzUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpIGFzIG9iamVjdDtcblxuXHRsZXQgcHJvdG87XG5cdGxldCBwcm90b1BvaW50ZXIgPSB0aGlzIGFzIG9iamVjdDtcblx0bGV0IHByb3RvQ29uc3RyY3V0b3I7XG5cblx0bGV0IGNvbnN0cnVjdG9ycyA9IGZhbHNlO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Ly8gY29uc3QgaGFzUHJveHlSZWZlcmVuY2UgPSBwcm90b1BvaW50ZXJbU3ltYm9sVHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZV0gYXMgdW5rbm93biBhcyBib29sZWFuO1xuXHQvLyBpZiAoaGFzUHJveHlSZWZlcmVuY2UpIHtcblx0Ly8gXHR0aHJvdyBuZXcgRXJyb3IoJ011bHRpcGxlIFR5cGXDmG1hdGljYSBpbnN0YW50aWF0aW9ucyBhcmUgbm90IGFsbG93ZWQgZm9yIHRoZSBzYW1lIFByb3RvdHlwZSBDaGFpbiEnKTtcblx0Ly8gfVxuXG5cdGRvIHtcblx0XHRwcm90byA9IHByb3RvUG9pbnRlcjtcblx0XHRwcm90b1BvaW50ZXIgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuXHRcdGlmIChCYXNlQ29uc3RydWN0b3JQcm90b3R5cGUucHJvdG90eXBlID09PSBwcm90b1BvaW50ZXIpIHtcblx0XHRcdGNvbnN0cnVjdG9ycyA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYgKCFwcm90b1BvaW50ZXIpIGJyZWFrO1xuXHRcdGNvbnN0IGRlc2NyaXB0b3IgPSBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90b1BvaW50ZXIsICdjb25zdHJ1Y3RvcicpO1xuXHRcdGlmICghZGVzY3JpcHRvcikgY29udGludWU7XG5cdFx0Y29uc3QgdmFsdWUgPSBkZXNjcmlwdG9yLnZhbHVlIHx8IGRlc2NyaXB0b3IuZ2V0O1xuXHRcdC8vIGlmICghdmFsdWUpIGNvbnRpbnVlO1xuXHRcdHByb3RvQ29uc3RyY3V0b3IgPSB2YWx1ZTtcblx0fSB3aGlsZSAocHJvdG9Db25zdHJjdXRvciAhPT0gQmFzZUNvbnN0cnVjdG9yUHJvdG90eXBlKTtcblxuXHRpZiAoIWNvbnN0cnVjdG9ycyAmJiBwcm90b0NvbnN0cmN1dG9yICE9PSBCYXNlQ29uc3RydWN0b3JQcm90b3R5cGUpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBzZXR1cCBUeXBlw5htYXRpY2EgaGFuZGxlciEnKTtcblx0fVxuXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgSW5zdGFuY2VQcm90b3R5cGUpO1xuXHRpZiAoZnJlZXplUHJvdG9zKSB7XG5cdFx0T2JqZWN0LmZyZWV6ZShjbGFzc1Byb3RvdHlwZSk7XG5cdH1cblx0Ly8gQHRzLWlnbm9yZVxuXHRyZXR1cm4gdGhpcztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbn0gYXMge1xuXHRuZXc8VCBleHRlbmRzIG9iamVjdCB8IHt9PihfdGFyZ2V0PzogVCwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucyk6IFRcblx0PFQgZXh0ZW5kcyBvYmplY3QgfCB7fSwgUyBleHRlbmRzIFQ+KF90YXJnZXQ/OiBTIGV4dGVuZHMgaW5mZXIgSW5mZXJyZWRTID8gSW5mZXJyZWRTIDoge30sIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpOiBTXG59O1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG5jb25zdCBmcmVlemVDbGFzc1Byb3RvdHlwZXMgPSAoaW5zdGFuY2U6IG9iamVjdCwgc2hvdWxkRnJlZXplOiBib29sZWFuKSA9PiB7XG5cdGlmICghc2hvdWxkRnJlZXplKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgZmlyc3QgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoaW5zdGFuY2UpO1xuXHRjb25zdCBmaXJzdElzUHJveHkgPSBmaXJzdCAhPT0gbnVsbCAmJiAhIVJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZpcnN0LCBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlKTtcblx0aWYgKGZpcnN0SXNQcm94eSkge1xuXHRcdE9iamVjdC5mcmVlemUoQmFzZUNsYXNzLnByb3RvdHlwZSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IHAgPSBmaXJzdDtcblx0d2hpbGUgKHAgIT09IG51bGwgJiYgcCAhPT0gQmFzZUNsYXNzLnByb3RvdHlwZSAmJiBwICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG5cdFx0Y29uc3QgbmV4dCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwKTtcblx0XHRjb25zdCBuZXh0SXNQcm94eSA9IG5leHQgIT09IG51bGwgJiYgISFSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuZXh0LCBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlKTtcblx0XHRPYmplY3QuZnJlZXplKHApO1xuXHRcdGlmIChuZXh0SXNQcm94eSkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHAgPSBuZXh0O1xuXHR9XG5cdE9iamVjdC5mcmVlemUoQmFzZUNsYXNzLnByb3RvdHlwZSk7XG59O1xuXG5leHBvcnQgY2xhc3MgQmFzZUNsYXNzIHtcblx0Y29uc3RydWN0b3IoX3RhcmdldD86IG9iamVjdCwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucykge1xuXHRcdGNvbnN0IHsgZnJvemVuUHJvdG90eXBlczogZnJlZXplUHJvdG9zID0gdHJ1ZSB9ID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAodGhpc1tTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSkge1xuXHRcdFx0ZnJlZXplQ2xhc3NQcm90b3R5cGVzKHRoaXMsIGZyZWV6ZVByb3Rvcyk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zdCB0YXJnZXQgPSBiYXNlVGFyZ2V0KF90YXJnZXQpIGFzIG9iamVjdDtcblx0XHRjb25zdCBwcm94eSA9IGdldFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UodGFyZ2V0LCBvcHRpb25zKTtcblx0XHRjb25zdCBpbnN0YW5jZVByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xuXG5cdFx0aWYgKGluc3RhbmNlUHJvdG8gPT09IEJhc2VDbGFzcy5wcm90b3R5cGUpIHtcblx0XHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBwcm94eSk7XG5cdFx0XHRmcmVlemVDbGFzc1Byb3RvdHlwZXModGhpcywgZnJlZXplUHJvdG9zKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGxldCBjbGFzc1Byb3RvID0gaW5zdGFuY2VQcm90bztcblx0XHRsZXQgcGFyZW50UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2xhc3NQcm90byk7XG5cdFx0d2hpbGUgKHBhcmVudFByb3RvICE9PSBCYXNlQ2xhc3MucHJvdG90eXBlICYmIHBhcmVudFByb3RvICE9PSBudWxsKSB7XG5cdFx0XHRjbGFzc1Byb3RvID0gcGFyZW50UHJvdG87XG5cdFx0XHRwYXJlbnRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjbGFzc1Byb3RvKTtcblx0XHR9XG5cblx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY2xhc3NQcm90bywgcHJveHkpO1xuXHRcdGZyZWV6ZUNsYXNzUHJvdG90eXBlcyh0aGlzLCBmcmVlemVQcm90b3MpO1xuXHR9XG59XG5cblxuY29uc3Qgc3RyaWN0ID0gZnVuY3Rpb24gKF90YXJnZXQ/OiBvYmplY3QsIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpIHtcblx0Y29uc3QgeyBmcm96ZW5Qcm90b3R5cGVzOiBmcmVlemVQcm90b3MgPSB0cnVlIH0gPSBvcHRpb25zIHx8IHt9O1xuXG5cdGNvbnN0IGRlY29yYXRvciA9IGZ1bmN0aW9uPFQ+KGNzdHI6IFQpOiBUIHtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAoY3N0ci5wcm90b3R5cGVbU3ltYm9sVHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZV0pIHtcblx0XHRcdHJldHVybiBjc3RyO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRhcmdldCA9IGJhc2VUYXJnZXQoX3RhcmdldCk7XG5cdFx0Y29uc3QgcHJveHkgPSBnZXRUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlKHRhcmdldCwgb3B0aW9ucyk7XG5cdFx0Y29uc3QgX3JlcGxhY2VyID0gT2JqZWN0LmNyZWF0ZShwcm94eSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNzdHIucHJvdG90eXBlLCBfcmVwbGFjZXIpO1xuXHRcdGlmIChmcmVlemVQcm90b3MpIHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdE9iamVjdC5mcmVlemUoY3N0ci5wcm90b3R5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjc3RyO1xuXG5cblx0XHQvLyBjb25zdCBNeUNsYXNzUHJveHkgPSBuZXcgUHJveHkoY3N0ciwge1xuXHRcdC8vIFx0Y29uc3RydWN0KF8sIGFyZ3VtZW50c0xpc3QsIG5ld1RhcmdldCkge1xuXHRcdC8vIFx0XHRkZWJ1Z2dlcjtcblx0XHQvLyBcdFx0Y29uc3QgdGFyZ2V0ID0gYmFzZVRhcmdldChfdGFyZ2V0KTtcblx0XHQvLyBcdFx0Y29uc3QgcHJveHkgPSBnZXRUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlKHRhcmdldCk7XG5cdFx0Ly8gXHRcdGNvbnN0IF9yZXBsYWNlciA9IE9iamVjdC5jcmVhdGUocHJveHkpO1xuXG5cdFx0Ly8gXHRcdGNvbnN0IF9wcm90byA9IGNzdHIucHJvdG90eXBlO1xuXG5cdFx0Ly8gXHRcdGNvbnN0IHByb3RvID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YoX3Byb3RvKSk7XG5cdFx0Ly8gXHRcdHByb3RvLmlBbVByb3RvID0gdHJ1ZTtcblxuXHRcdC8vIFx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY3N0ci5wcm90b3R5cGUsIHByb3RvKTtcblxuXHRcdC8vIFx0XHRjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKF9wcm90byk7XG5cdFx0Ly8gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHByb3RvLCBkZXNjcmlwdG9ycyk7XG5cblx0XHQvLyBcdFx0Y29uc3QgcmVwbGFjZXIgPSBPYmplY3QuY3JlYXRlKF9yZXBsYWNlcik7XG5cdFx0Ly8gXHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgcmVwbGFjZXIpO1xuXG5cblx0XHQvLyBcdFx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNzdHIucHJvdG90eXBlLCBwcm90byk7XG5cdFx0Ly8gXHRcdGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuY29uc3RydWN0KGNzdHIsIGFyZ3VtZW50c0xpc3QsIG5ld1RhcmdldCk7XG5cblx0XHQvLyBcdFx0ZGVidWdnZXI7XG5cdFx0Ly8gXHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZihjc3RyLnByb3RvdHlwZSwgX3Byb3RvKTtcblx0XHQvLyBcdFx0ZGVidWdnZXI7XG5cblx0XHQvLyBcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHQvLyBcdH0sXG5cdFx0Ly8gfSk7XG5cdFx0Ly8gcmV0dXJuIE15Q2xhc3NQcm94eTtcblx0fTtcblxuXHRyZXR1cm4gZGVjb3JhdG9yO1xuXG59O1xuZXhwb3J0IGNvbnN0IHsgU3ltYm9sSW5pdGlhbFZhbHVlIH0gPSBGaWVsZENvbnN0cnVjdG9yO1xuY29uc3QgRmllbGRDb25zdHJ1Y3RvckV4cG9ydCA9IEZpZWxkQ29uc3RydWN0b3I7XG5leHBvcnQgeyBGaWVsZENvbnN0cnVjdG9yRXhwb3J0IGFzIEZpZWxkQ29uc3RydWN0b3IgfTtcbmV4cG9ydCBjb25zdCBTdHJpY3QgPSBzdHJpY3Q7XG5cbi8qKlxuICogRmllbGRzIHRoYXQgY2VydGFpbmx5IHBhc3NlZCB0aHJvdWdoIHRoZSBkZWZpbmUgbWFjaGluZXJ5IGZvciB0aGlzXG4gKiBpbnN0YW5jZS4gUmV0dXJucyBhIGNvcHkgb2YgdGhlIGludGVybmFsIFNldCDigJQgc2FmZSBmb3IgdGhlIGNhbGxlclxuICogdG8gbXV0YXRlLlxuICovXG5leHBvcnQgY29uc3QgZ2V0Q29uc3RydWN0ZWRGaWVsZHMgPSAoaW5zdGFuY2U6IG9iamVjdCk6IFNldDxzdHJpbmcgfCBzeW1ib2w+ID0+IHtcblx0Y29uc3QgcmVjb3JkID0gY29uc3RydWN0aW9uUmVjb3Jkcy5nZXQoaW5zdGFuY2UpO1xuXHRjb25zdCByZXN1bHQgPSByZWNvcmQgPyBuZXcgU2V0KHJlY29yZC5maWVsZHMpIDogbmV3IFNldDxzdHJpbmcgfCBzeW1ib2w+KCk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCBmaW5hbGlzZUZpZWxkcyA9IChpbnN0YW5jZTogb2JqZWN0LCBuYW1lczogKHN0cmluZyB8IHN5bWJvbClbXSk6IHZvaWQgPT4ge1xuXHRjb25zdCByZWNvcmQgPSBlbnN1cmVSZWNvcmQoaW5zdGFuY2UpO1xuXHRuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG5cdFx0aWYgKHJlY29yZC5maWVsZHMuaGFzKG5hbWUpKSB7XG5cdFx0XHQvLyBhbHJlYWR5IHBhc3NlZCB0aHJvdWdoIHRoZSBtYWNoaW5lcnlcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGluc3RhbmNlLCBuYW1lKTtcblx0XHRpZiAoIWRlc2NyaXB0b3IgfHwgISgndmFsdWUnIGluIGRlc2NyaXB0b3IpKSB7XG5cdFx0XHQvLyBub3RoaW5nIGhpZGRlbiB1bmRlciB0aGF0IG5hbWUsIG9yIG5vdCBhIGRhdGEgZmllbGRcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZGVsZXRlIChpbnN0YW5jZSBhcyBSZWNvcmQ8UHJvcGVydHlLZXksIHVua25vd24+KVtuYW1lXTtcblx0XHQvLyBmaW5hbGl6ZWQgZmllbGRzIHN0YXkgY29uZmlndXJhYmxlOiB0aGV5IGFyZSB0aGUgb25lcyBgdW53cmFwYFxuXHRcdC8vIGlzIGFsbG93ZWQgdG8gdHVybiBiYWNrIGludG8gcGxhaW4gdmFsdWUgcHJvcGVydGllc1xuXHRcdGNyZWF0ZVByb3BlcnR5KG5hbWUsIGRlc2NyaXB0b3IudmFsdWUsIGluc3RhbmNlLCByZWNvcmQub3B0aW9ucywgdHJ1ZSk7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBBdXRvIGZpbmFsaXphdGlvbjogZXZlcnkgaGlkZGVubHktYWRkZWQgb3duIGZpZWxkIG9mIHRoZSBpbnN0YW5jZVxuICogKGNsYXNzIGZpZWxkcyBhbmQgb3RoZXIgZGVmaW5lLXNlbWFudGljcyB3cml0ZXMgdGhhdCBieXBhc3NlZCB0aGVcbiAqIHByb3h5KSBpcyBkZWxldGVkIGFuZCByZS1lc3RhYmxpc2hlZCB0aHJvdWdoIHRoZSBkZWZpbmUgbWFjaGluZXJ5LlxuICogU2V0cyB0aGUgZmluYWxpemVkIGZsYWcg4oCUIGB0cnVlYCBtZWFucyBhdXRvIG1vZGUgcmFuLlxuICovXG5leHBvcnQgY29uc3QgZmluYWxpemUgPSAoaW5zdGFuY2U6IG9iamVjdCk6IHZvaWQgPT4ge1xuXHRjb25zdCByZWNvcmQgPSBlbnN1cmVSZWNvcmQoaW5zdGFuY2UpO1xuXHRmaW5hbGlzZUZpZWxkcyhpbnN0YW5jZSwgUmVmbGVjdC5vd25LZXlzKGluc3RhbmNlKSk7XG5cdHJlY29yZC5maW5hbGl6ZWQgPSB0cnVlO1xufTtcblxuLyoqXG4gKiBQYXJ0aWFsIGZpbmFsaXphdGlvbjogcmUtZXN0YWJsaXNoIG9ubHkgdGhlIGxpc3RlZCBmaWVsZHMuXG4gKiBEb2VzIE5PVCBzZXQgdGhlIGZpbmFsaXplZCBmbGFnIOKAlCB0aGF0IGZsYWcgbWVhbnMgYXV0byBtb2RlIHJhbixcbiAqIGV2ZXJ5dGhpbmcgZWxzZSBpcyB0aGUgdXNlcidzIGNob2ljZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGZpbmFsaXplQnkgPSAoaW5zdGFuY2U6IG9iamVjdCwgZmllbGRzOiAoc3RyaW5nIHwgc3ltYm9sKVtdKTogdm9pZCA9PiB7XG5cdGZpbmFsaXNlRmllbGRzKGluc3RhbmNlLCBmaWVsZHMpO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzRmluYWxpemVkID0gKGluc3RhbmNlOiBvYmplY3QpOiBib29sZWFuID0+IHtcblx0Y29uc3QgcmVjb3JkID0gY29uc3RydWN0aW9uUmVjb3Jkcy5nZXQoaW5zdGFuY2UpO1xuXHRjb25zdCByZXN1bHQgPSByZWNvcmQgPyByZWNvcmQuZmluYWxpemVkIDogZmFsc2U7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFR1cm4gYSBndWFyZGVkIGZpZWxkIGJhY2sgaW50byBhIHBsYWluIHZhbHVlIHByb3BlcnR5LlxuICogQWxsb3dlZCBvbmx5IGZvciBmaWVsZHMgcmUtZXN0YWJsaXNoZWQgYnkgZmluYWxpemUvZmluYWxpemVCeSDigJRcbiAqIHRoZXkgc3RheSBjb25maWd1cmFibGUgYnkgZGVzaWduLiBGaWVsZHMgZ3VhcmRlZCBzaW5jZSBjb25zdHJ1Y3Rpb25cbiAqIGFyZSBub24tY29uZmlndXJhYmxlOiB0aGF0IGxvY2sgaXMgdGhlIGVzc2VudGlhbCBkZXNpZ24gb2YgdGhlIGxpYi5cbiAqIFByaW1pdGl2ZXMgYXJlIHJlYWQgYmFjayB2aWEgLnZhbHVlT2YoKTsgb2JqZWN0cyBhcmUgcGxhY2VkIGFzLWlzLlxuICovXG5leHBvcnQgY29uc3QgdW53cmFwID0gKGluc3RhbmNlOiBvYmplY3QsIGZpZWxkOiBzdHJpbmcgfCBzeW1ib2wpOiB2b2lkID0+IHtcblx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGluc3RhbmNlLCBmaWVsZCk7XG5cdGlmICghZGVzY3JpcHRvciB8fCAhZGVzY3JpcHRvci5jb25maWd1cmFibGUgfHwgdHlwZW9mIGRlc2NyaXB0b3IuZ2V0ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihFcnJvcnNOYW1lcy5GT1JCSURERU5fVU5XUkFQKTtcblx0fVxuXHRjb25zdCBjdXJyZW50ID0gKGluc3RhbmNlIGFzIFJlY29yZDxQcm9wZXJ0eUtleSwgdW5rbm93bj4pW2ZpZWxkXTtcblx0Y29uc3QgY3VycmVudFZhbHVlT2YgPSAoY3VycmVudCBhcyB7IHZhbHVlT2Y/OiB1bmtub3duIH0pPy52YWx1ZU9mO1xuXHRjb25zdCB1bndyYXBwZWQgPSB0eXBlb2YgY3VycmVudFZhbHVlT2YgPT09ICdmdW5jdGlvbidcblx0XHQ/IChjdXJyZW50IGFzIHsgdmFsdWVPZjogKCkgPT4gdW5rbm93biB9KS52YWx1ZU9mKClcblx0XHQ6IGN1cnJlbnQ7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0YW5jZSwgZmllbGQsIHtcblx0XHR2YWx1ZSAgICAgICAgOiB1bndyYXBwZWQsXG5cdFx0d3JpdGFibGUgICAgIDogdHJ1ZSxcblx0XHRlbnVtZXJhYmxlICAgOiB0cnVlLFxuXHRcdGNvbmZpZ3VyYWJsZSA6IHRydWVcblx0fSk7XG59O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gc2V0dXBDb21tb25KUygpIHtcblx0aWYgKHR5cGVvZiBtb2R1bGUgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgJ2V4cG9ydHMnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnQmFzZUNsYXNzJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBCYXNlQ2xhc3M7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdGaWVsZENvbnN0cnVjdG9yJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBGaWVsZENvbnN0cnVjdG9yO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnU3ltYm9sSW5pdGlhbFZhbHVlJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBTeW1ib2xJbml0aWFsVmFsdWU7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnYmFzZVRhcmdldCcsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gYmFzZVRhcmdldDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ1N0cmljdCcsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gc3RyaWN0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnZ2V0Q29uc3RydWN0ZWRGaWVsZHMnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIGdldENvbnN0cnVjdGVkRmllbGRzO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnZmluYWxpemUnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIGZpbmFsaXplO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnZmluYWxpemVCeScsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gZmluYWxpemVCeTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ2lzRmluYWxpemVkJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBpc0ZpbmFsaXplZDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ3Vud3JhcCcsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdW53cmFwO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcbn1cblxuc2V0dXBDb21tb25KUygpO1xuXG5PYmplY3QuZnJlZXplKEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZSk7XG5PYmplY3QuZnJlZXplKEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZS5wcm90b3R5cGUpO1xuIl19