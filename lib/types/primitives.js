'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitives = void 0;
const errors_1 = require("../errors");
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
                                throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
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
                    const answer = value[prop];
                    return answer;
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
            const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
exports.primitives = primitives;
//# sourceMappingURL=primitives.js.map