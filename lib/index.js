'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClass = void 0;
const ErrorsNames = {
    TYPE_MISMATCH: 'Type Mismatch',
    ACCESS_DENIED: 'Value Access Denied',
    MISSING_PROP: 'Attempt to Access to Undefined Prop',
    RIP_FUNCTIONS: 'Functions are Restricted'
};
const PRIMITIVE_TYPES = [
    'string',
    'number',
    'boolean',
];
const isPrimitive = (value) => {
    return PRIMITIVE_TYPES.includes(typeof value);
};
const primitives = (initialValue) => {
    let value = Object(initialValue);
    const initialType = typeof initialValue;
    return {
        get() {
            const proxyAsValue = new Proxy(value, {
                get(_, prop) {
                    if (prop === Symbol.toPrimitive) {
                        return function (hint) {
                            if (hint !== initialType) {
                                throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
                            }
                            return value.valueOf();
                        };
                    }
                    if (prop === 'valueOf') {
                        return function () {
                            return value.valueOf();
                        };
                    }
                    if (value[prop] instanceof Function) {
                        return value[prop].bind(value);
                    }
                    return value[prop];
                }
            });
            return proxyAsValue;
        },
        set(replacementValue) {
            if (replacementValue instanceof value.constructor) {
                value = replacementValue;
                return value;
            }
            const prevalue = Object(replacementValue);
            if (prevalue instanceof value.constructor) {
                value = prevalue;
                return value;
            }
            const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
const special = (value) => {
    return {
        get() {
            return value;
        },
        set(replacementValue) {
            if (typeof replacementValue === typeof value) {
                value = replacementValue;
                return value;
            }
            const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
const nullish = (value) => {
    return {
        get() {
            return value;
        },
        set() {
            const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
const objects = (value) => {
    return {
        get() {
            return value;
        },
        set(replacementValue) {
            if (replacementValue instanceof Object && replacementValue.constructor === value.constructor) {
                value = replacementValue;
                return value;
            }
            const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
const functions = () => {
    throw new TypeError(ErrorsNames.RIP_FUNCTIONS);
};
const resolver = Object.entries({
    primitives,
    special,
    nullish,
    objects,
    functions
}).reduce((obj, [key, _handler]) => {
    obj[key] = function (initialValue, receiver) {
        const handler = _handler(initialValue);
        return {
            get() {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
                }
                return handler.get();
            },
            set(replacementValue) {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
                }
                return handler.set(replacementValue);
            }
        };
    };
    return obj;
}, {});
const createProperty = (propName, initialValue, receiver) => {
    const value = initialValue;
    const valueIsPrimitive = isPrimitive(initialValue);
    const isObject = typeof initialValue === 'object';
    const isFunction = initialValue instanceof Function;
    const isNull = initialValue === null;
    const type = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
    const descriptor = resolver[type](value, receiver);
    const result = Reflect.defineProperty(receiver, propName, Object.assign(Object.assign({}, descriptor), { enumerable: true }));
    return result;
};
const handlers = {
    get(target, prop, receiver) {
        const result = Reflect.get(target, prop, receiver);
        if (result !== undefined) {
            return result;
        }
        throw new Error(ErrorsNames.MISSING_PROP);
    },
    set(_, prop, value, receiver) {
        const result = createProperty(prop, value, receiver);
        return result;
    }
};
const BaseTarget = Object.create(null);
const BasePrototype = new Proxy(BaseTarget, handlers);
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
Reflect.setPrototypeOf(BaseConstructor.prototype, BasePrototype);
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
