'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullish = void 0;
const errors_1 = require("../errors");
const nullish = (value) => {
    return {
        get() {
            return value;
        },
        set() {
            const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
exports.nullish = nullish;
