export declare const BaseConstructorPrototype: {
    (): void;
    new (): unknown;
};
export declare class BaseClass extends BaseConstructorPrototype {
}
export { FieldConstructor } from './fields';
type StrictRuntime = {
    <T extends object>(...args: unknown[]): T;
};
export declare const Strict: StrictRuntime;
