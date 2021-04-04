'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClass = void 0;
const ErrorsNames = {
    TYPE_MISMATCH: 'Type Mismatch',
    ACCESS_DENIED: 'Value Access Denied',
    MISSING_PROP: 'Attempt to Access to Undefined Prop',
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
    return {
        get() {
            const proxyAsValue = new Proxy(value, {
                get(_, prop) {
                    if (prop === Symbol.toPrimitive) {
                        return function () {
                            throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
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
                value = Object(replacementValue);
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
const resolver = {
    primitives,
    special,
    nullish,
    objects,
};
const createProperty = (propName, initialValue, receiver) => {
    const value = initialValue;
    const valueIsPrimitive = isPrimitive(initialValue);
    const isObject = typeof initialValue === 'object';
    const isNull = initialValue === null;
    const type = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : 'special');
    const descriptor = resolver[type](value);
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
        return function () {
            return new BaseConstructor(InstanceTarget);
        };
    }
    const InstancePrototype = new Proxy(InstanceTarget, handlers);
    Reflect.setPrototypeOf(this, InstancePrototype);
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
