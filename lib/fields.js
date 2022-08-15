'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldConstructor = exports.SymbolInitialValue = void 0;
exports.SymbolInitialValue = Symbol('Initial Value');
const errors_1 = require("./errors");
class FieldConstructor {
    constructor(value) {
        this[exports.SymbolInitialValue] = value;
    }
    get get() {
        const self = this;
        return function () {
            return self[exports.SymbolInitialValue];
        };
    }
    get set() {
        return function () {
            throw new TypeError(errors_1.ErrorsNames.FORBIDDEN_RE);
        };
    }
}
exports.FieldConstructor = FieldConstructor;
Object.freeze(FieldConstructor.prototype);
Object.seal(FieldConstructor.prototype);
