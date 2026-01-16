export declare const SymbolTypeomaticaProxyReference: unique symbol;
export declare const BaseConstructorPrototype: {
    new (): unknown;
    (): void;
};
export declare class BaseClass {
    constructor(_target?: object | null);
}
export { FieldConstructor } from './fields';
export declare const SymbolInitialValue: symbol;
type StrictRuntime = {
    <T extends object>(target: object): T;
};
export declare const Strict: StrictRuntime;
