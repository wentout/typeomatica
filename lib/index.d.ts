export declare type IDEF<T, P = {}, R = {}> = {
    new (...args: any[]): T;
    (this: T, ...args: any[]): R;
    prototype: P;
};
declare const BaseConstructor: ObjectConstructor;
export declare class BaseClass extends BaseConstructor {
}
export {};
