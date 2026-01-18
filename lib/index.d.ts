export declare const baseTarget: (_proto?: object) => any;
export declare const SymbolTypeomaticaProxyReference: unique symbol;
export declare const BaseConstructorPrototype: {
    new <T extends object | {}>(_target?: T): T;
    <T extends object | {}, S extends T>(_target?: S extends infer S_1 ? S_1 : {}): S;
};
export declare class BaseClass {
    constructor(_target?: object);
}
export declare const SymbolInitialValue: symbol;
export declare const Strict: (_target?: object) => <T>(cstr: T) => T;
