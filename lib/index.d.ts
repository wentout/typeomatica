import { FieldConstructor } from './fields.js';
export interface TypeomaticaOptions {
    strictAccessCheck?: boolean;
    frozenPrototypes?: boolean;
}
export declare const baseTarget: (_proto?: object) => any;
export declare const SymbolTypeomaticaProxyReference: unique symbol;
export declare const BaseConstructorPrototype: {
    new <T extends object | {}>(_target?: T, options?: TypeomaticaOptions): T;
    <T extends object | {}, S extends T>(_target?: S extends infer InferredS ? InferredS : {}, options?: TypeomaticaOptions): S;
};
export declare class BaseClass {
    constructor(_target?: object, options?: TypeomaticaOptions);
}
export declare const SymbolInitialValue: symbol;
declare const FieldConstructorExport: typeof FieldConstructor;
export { FieldConstructorExport as FieldConstructor };
export declare const Strict: (_target?: object, options?: TypeomaticaOptions) => <T>(cstr: T) => T;
/**
 * Fields that certainly passed through the define machinery for this
 * instance. Returns a copy of the internal Set — safe for the caller
 * to mutate.
 */
export declare const getConstructedFields: (instance: object) => Set<string | symbol>;
/**
 * Auto finalization: every hiddenly-added own field of the instance
 * (class fields and other define-semantics writes that bypassed the
 * proxy) is deleted and re-established through the define machinery.
 * Sets the finalized flag — `true` means auto mode ran.
 */
export declare const finalize: (instance: object) => void;
/**
 * Partial finalization: re-establish only the listed fields.
 * Does NOT set the finalized flag — that flag means auto mode ran,
 * everything else is the user's choice.
 */
export declare const finalizeBy: (instance: object, fields: (string | symbol)[]) => void;
export declare const isFinalized: (instance: object) => boolean;
/**
 * Turn a guarded field back into a plain value property.
 * Allowed only for fields re-established by finalize/finalizeBy —
 * they stay configurable by design. Fields guarded since construction
 * are non-configurable: that lock is the essential design of the lib.
 * Primitives are read back via .valueOf(); objects are placed as-is.
 */
export declare const unwrap: (instance: object, field: string | symbol) => void;
