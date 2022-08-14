'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClass = void 0;
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
                return handler.get();
            },
            set(replacementValue) {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
                }
                return handler.set(replacementValue);
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
    const type = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
    const descriptor = (isObject && (value instanceof fields_1.FieldConstructor)) ?
        value
        : Object.assign({ enumerable: true }, resolver[type](value, receiver));
    const result = Reflect.defineProperty(receiver, propName, descriptor);
    return result;
};
const util = require('util');
const props2skip = new Set([util.inspect.custom, Symbol.toStringTag, Symbol.iterator]);
const handlers = {
    get(target, prop, receiver) {
        const result = Reflect.get(target, prop, receiver);
        if (result !== undefined) {
            return result;
        }
        if (prop === 'toJSON') {
            return function () {
                return JSON.stringify(Object.entries(this).reduce((obj, [key, value]) => {
                    obj[key] = value.valueOf();
                    return obj;
                }, {}));
            };
        }
        if (props2skip.has(prop)) {
            return undefined;
        }
        throw new Error(`${errors_1.ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] of ${receiver.constructor.name}`);
    },
    set(_, prop, value, receiver) {
        const result = createProperty(prop, value, receiver);
        return result;
    },
};
const BaseTarget = Object.create(null);
const BaseConstructor = function (InstanceTarget = BaseTarget) {
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
        protoPointer = Reflect.getPrototypeOf(protoPointer);
        protoConstrcutor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor').value;
    } while (protoConstrcutor !== BaseConstructor);
    Reflect.setPrototypeOf(protoPointer, InstancePrototype);
};
Object.defineProperty(module, 'exports', {
    get() {
        return BaseConstructor;
    },
    enumerable: true
});
class BaseClass extends BaseConstructor {
}
exports.BaseClass = BaseClass;
;
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
