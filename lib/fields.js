'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldConstructor = exports.SymbolInitialValue = void 0;
exports.SymbolInitialValue = Symbol('Initial Value');
exports.FieldConstructor = function (value) {
    this[exports.SymbolInitialValue] = value;
};
Object.freeze(exports.FieldConstructor.prototype);
Object.seal(exports.FieldConstructor.prototype);
