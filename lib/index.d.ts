export declare const baseTarget: (proto?: object | null) => any;
export declare const SymbolTypeomaticaProxyReference: unique symbol;
export declare const BaseConstructorPrototype: {
    new (): unknown;
    (): void;
};
export declare class BaseClass {
    constructor(_target?: object | null);
}
export declare const SymbolInitialValue: symbol;
type StrictRuntime = {
    <T extends object>(target: object): T;
};
export declare const Strict: StrictRuntime;
export {};
