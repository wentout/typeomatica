'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.special = void 0;
const errors_1 = require("../errors");
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
            const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
exports.special = special;
//# sourceMappingURL=special.js.map