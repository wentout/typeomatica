export declare const BaseConstructorPrototype: {
    new (): unknown;
    (): void;
};
export declare class BaseClass extends BaseConstructorPrototype {
}
export { FieldConstructor } from './fields';
export declare const SymbolInitialValue: symbol;
type StrictRuntime = {
    <T extends object>(...args: unknown[]): T;
};
export declare const Strict: StrictRuntime;
