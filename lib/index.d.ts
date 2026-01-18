export declare const baseTarget: (proto?: object | null) => any;
export declare const SymbolTypeomaticaProxyReference: unique symbol;
export declare const BaseConstructorPrototype: {
    new (): unknown;
    (): void;
};
export declare class BaseClass<T extends object, S extends T> {
    constructor(_target: S extends T ? S : never);
}
interface ITypeDefinition<T> {
    new (): T;
    (): void;
}
export declare const SymbolInitialValue: symbol;
export declare const Strict: <P extends object>(_target?: P | null) => <T extends ITypeDefinition<T>, M extends P & InstanceType<T>, IR extends { [key in keyof M]: M[key]; }>(cstr: T) => IR;
export {};
