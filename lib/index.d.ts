export declare type IDEF = {
    new (...args: any[]): object;
    (this: object, ...args: any[]): object;
    prototype: object;
};
declare const BaseConstructor: IDEF;
export declare class BaseClass extends BaseConstructor {
}
export {};
