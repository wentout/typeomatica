declare const BaseConstructor: ObjectConstructor;
export declare class BaseClass extends BaseConstructor {
}
export declare type IDEF<T, P = {}, R = {}> = {
    new (...args: unknown[]): T;
    (this: T, ...args: unknown[]): R;
    prototype: P;
};
export {};
