type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;
export declare const BaseConstructorPrototype: <P extends object, S extends Proto<T, P>, T extends {
    (): P;
    new (): { [key in keyof S]: S[key]; };
}>(this: T, InstanceTarget?: P) => T;
export declare class BaseClass extends BaseConstructorPrototype {
}
export { FieldConstructor } from './fields';
type StrictRuntime = {
    <T extends object>(...args: unknown[]): T;
};
export declare const Strict: StrictRuntime;
