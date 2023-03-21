'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldConstructor = void 0;
const errors_1 = require("./errors");
const SymbolInitialValue = Symbol('Initial Value');
class FieldConstructor {
    get get() {
        const self = this;
        return function () {
            return self[SymbolInitialValue];
        };
    }
    get set() {
        return function () {
            throw new TypeError(errors_1.ErrorsNames.FORBIDDEN_RE);
        };
    }
    constructor(value) {
        this[SymbolInitialValue] = value;
    }
    static get SymbolInitialValue() {
        return SymbolInitialValue;
    }
}
exports.FieldConstructor = FieldConstructor;
Object.freeze(FieldConstructor.prototype);
Object.seal(FieldConstructor.prototype);
