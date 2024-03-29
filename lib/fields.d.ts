declare const SymbolInitialValue: unique symbol;
interface FieldDefinition {
    [SymbolInitialValue]: unknown;
}
export declare class FieldConstructor implements FieldDefinition {
    [SymbolInitialValue]: unknown;
    get get(): () => unknown;
    get set(): () => never;
    constructor(value: unknown);
    static get SymbolInitialValue(): symbol;
}
export {};
