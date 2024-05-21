'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.objects = void 0;
const errors_1 = require("../errors");
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
            const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
exports.objects = objects;
//# sourceMappingURL=objects.js.map