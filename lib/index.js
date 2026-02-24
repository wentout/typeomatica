'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strict = exports.SymbolInitialValue = exports.BaseClass = exports.BaseConstructorPrototype = exports.SymbolTypeomaticaProxyReference = exports.baseTarget = void 0;
const errors_1 = require("./errors");
const types_1 = require("./types");
const fields_1 = require("./fields");
const resolver = Object.entries({
    primitives: types_1.primitives,
    special: types_1.special,
    nullish: types_1.nullish,
    objects: types_1.objects,
    functions: types_1.functions
}).reduce((obj, [key, _handler]) => {
    obj[key] = function (initialValue, receiver) {
        const handler = _handler(initialValue);
        return {
            get() {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
                }
                const result = handler.get();
                return result;
            },
            set(replacementValue) {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
                }
                const result = handler.set(replacementValue);
                return result;
            }
        };
    };
    return obj;
}, {});
const createProperty = (propName, initialValue, receiver) => {
    const value = initialValue;
    const valueIsPrimitive = (0, types_1.isPrimitive)(initialValue);
    const isObject = typeof initialValue === 'object';
    const isFunction = initialValue instanceof Function;
    const isNull = initialValue === null;
    const types = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
    const descriptor = (isObject && (value instanceof fields_1.FieldConstructor)) ?
        value
        :
            {
                enumerable: true,
                ...resolver[types](value, receiver),
            };
    const result = Reflect.defineProperty(receiver, propName, descriptor);
    return result;
};
const props2skip = new Set([
    Symbol.toStringTag,
    Symbol.iterator,
    'toString',
    'valueOf',
    'href'
]);
const util = require('util');
const hasNodeInspect = (util && util.inspect && util.inspect.custom);
(hasNodeInspect && (props2skip.add(util.inspect.custom)));
const handlers = {
    get(target, prop, receiver) {
        const result = Reflect.get(target, prop, receiver);
        if (result !== undefined) {
            return result;
        }
        if (prop === 'toJSON') {
            return function () {
                const entries = Object.entries(this);
                return JSON.stringify(entries.reduce((obj, [key, value]) => {
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
        const errorMessage = `${errors_1.ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] for ${name}`;
        throw new Error(errorMessage);
    },
    set(_, prop, value, receiver) {
        const result = createProperty(prop, value, receiver);
        return result;
    },
    setPrototypeOf() {
        throw new Error('Setting prototype is not allowed!');
    },
    defineProperty() {
        throw new Error('Defining new Properties is not allowed!');
    },
    deleteProperty() {
        throw new Error('Properties Deletion is not allowed!');
    },
};
Object.freeze(handlers);
const baseTarget = (_proto) => {
    const proto = typeof _proto === 'object' ? _proto : null;
    const answer = Object.create(proto);
    return answer;
};
exports.baseTarget = baseTarget;
exports.SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target) => {
    const target = Object.create(_target);
    const id = `TypeØmaticaProxyReference-${Math.random()}`;
    Object.defineProperty(target, exports.SymbolTypeomaticaProxyReference, {
        get() {
            return id;
        }
    });
    const proxy = new Proxy(target, handlers);
    return proxy;
};
exports.BaseConstructorPrototype = function (_target) {
    if (!new.target) {
        const self = exports.BaseConstructorPrototype.bind(this, _target);
        self.prototype = {
            constructor: exports.BaseConstructorPrototype
        };
        return self;
    }
    if (this[exports.SymbolTypeomaticaProxyReference]) {
        return this;
    }
    const target = (0, exports.baseTarget)(_target);
    const InstancePrototype = getTypeomaticaProxyReference(target);
    let proto;
    let protoPointer = this;
    let protoConstrcutor;
    let constructors = false;
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
        protoConstrcutor = value;
    } while (protoConstrcutor !== exports.BaseConstructorPrototype);
    if (!constructors && protoConstrcutor !== exports.BaseConstructorPrototype) {
        throw new Error('Unable to setup TypeØmatica handler!');
    }
    Object.setPrototypeOf(proto, InstancePrototype);
    return this;
};
Object.defineProperty(module, 'exports', {
    get() {
        return exports.BaseConstructorPrototype;
    },
    enumerable: true
});
class BaseClass {
    constructor(_target) {
        if (this[exports.SymbolTypeomaticaProxyReference]) {
            return this;
        }
        const target = (0, exports.baseTarget)(_target);
        const proxy = getTypeomaticaProxyReference(target);
        let proto = this;
        let protoPointer;
        let found = false;
        do {
            protoPointer = Object.getPrototypeOf(proto);
            if (protoPointer === Object.prototype) {
                found = true;
                break;
            }
            proto = protoPointer;
        } while (!found);
        Object.setPrototypeOf(proto, proxy);
    }
}
exports.BaseClass = BaseClass;
const strict = function (_target) {
    const decorator = function (cstr) {
        if (cstr.prototype[exports.SymbolTypeomaticaProxyReference]) {
            return cstr;
        }
        const target = (0, exports.baseTarget)(_target);
        const proxy = getTypeomaticaProxyReference(target);
        const _replacer = Object.create(proxy);
        Object.setPrototypeOf(cstr.prototype, _replacer);
        return cstr;
    };
    return decorator;
};
exports.SymbolInitialValue = fields_1.FieldConstructor.SymbolInitialValue;
exports.Strict = strict;
Object.defineProperty(module.exports, 'BaseClass', {
    get() {
        return BaseClass;
    },
    enumerable: true
});
Object.defineProperty(module.exports, 'FieldConstructor', {
    get() {
        return fields_1.FieldConstructor;
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
Object.freeze(exports.BaseConstructorPrototype);
Object.freeze(exports.BaseConstructorPrototype.prototype);
