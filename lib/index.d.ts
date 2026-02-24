export interface TypeomaticaOptions {
    strictAccessCheck?: boolean;
}
export declare const baseTarget: (_proto?: object) => any;
export declare const SymbolTypeomaticaProxyReference: unique symbol;
export declare const BaseConstructorPrototype: {
    new <T extends object | {}>(_target?: T, options?: TypeomaticaOptions): T;
    <T extends object | {}, S extends T>(_target?: S extends infer S_1 ? S_1 : {}, options?: TypeomaticaOptions): S;
};
export declare class BaseClass {
    constructor(_target?: object, options?: TypeomaticaOptions);
}
export declare const SymbolInitialValue: symbol;
export declare const Strict: (_target?: object, options?: TypeomaticaOptions) => <T>(cstr: T) => T;
