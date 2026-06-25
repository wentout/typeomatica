// oxlint-disable typescript/no-this-alias
/* eslint-disable no-debugger */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strict = exports.FieldConstructor = exports.SymbolInitialValue = exports.BaseClass = exports.BaseConstructorPrototype = exports.SymbolTypeomaticaProxyReference = exports.baseTarget = void 0;
const util_1 = require("util");
const errors_js_1 = require("./errors.js");
const index_js_1 = require("./types/index.js");
const fields_js_1 = require("./fields.js");
const createResolver = (options = {}) => {
    const { strictAccessCheck = false } = options;
    return Object.entries({
        primitives: index_js_1.primitives,
        special: index_js_1.special,
        nullish: index_js_1.nullish,
        objects: index_js_1.objects,
        functions: index_js_1.functions
    }).reduce((obj, [key, _handler]) => {
        // @ts-ignore
        obj[key] = function (initialValue, receiver) {
            const handler = _handler(initialValue);
            return {
                get() {
                    const invocationThis = this;
                    if (strictAccessCheck && invocationThis !== receiver) {
                        throw new ReferenceError(errors_js_1.ErrorsNames.ACCESS_DENIED);
                    }
                    const result = handler.get();
                    return result;
                },
                set(replacementValue) {
                    const invocationThis = this;
                    if (strictAccessCheck && invocationThis !== receiver) {
                        throw new ReferenceError(errors_js_1.ErrorsNames.ACCESS_DENIED);
                    }
                    const result = handler.set(replacementValue);
                    return result;
                }
            };
        };
        return obj;
    }, {});
};
const createProperty = (propName, initialValue, receiver, options) => {
    const value = initialValue;
    const valueIsPrimitive = (0, index_js_1.isPrimitive)(initialValue);
    const isObject = typeof initialValue === 'object';
    const isFunction = initialValue instanceof Function;
    const isNull = initialValue === null;
    /**
     * special: undefined or BigInt or Symbol
     * 	or other non constructible type
     */
    const types = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
    const resolver = createResolver(options);
    const descriptor = (isObject && (value instanceof fields_js_1.FieldConstructor)) ?
        value : {
        enumerable: true,
        // @ts-ignore
        ...resolver[types](value, receiver),
    };
    // if (value instanceof FieldConstructor) {
    // 	descriptor;
    // 	debugger;
    // }
    const result = Reflect.defineProperty(receiver, propName, descriptor);
    return result;
};
// line below 'href' is for util.inspect works, useful for v24
const props2skip = new Set([
    Symbol.toStringTag,
    Symbol.iterator,
    // Symbol.toPrimitive,
    'toString',
    'valueOf',
    'href'
]);
// const props2skip = new Set([Symbol.toStringTag, Symbol.iterator]);
const hasNodeInspect = (util_1.inspect && util_1.inspect.custom);
// oxlint-disable-next-line no-unused-expressions
(hasNodeInspect && (props2skip.add(util_1.inspect.custom)));
const createHandlers = (options) => ({
    get(target, prop, receiver) {
        const result = Reflect.get(target, prop, receiver);
        if (result !== undefined) {
            return result;
        }
        if (prop === 'toJSON') {
            return function () {
                const entries = Object.entries(this);
                return JSON.stringify(entries.reduce((obj, [key, value]) => {
                    // @ts-ignore
                    obj[key] = value.valueOf();
                    return obj;
                }, {}));
            };
        }
        const { name } = receiver.constructor;
        if (props2skip.has(prop)) {
            const message = `${name} lacks definition of [ ${String(prop).valueOf()} ]`;
            return message;
        }
        // const errorMessage = `${ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] for ${name}`;
        // throw new Error(errorMessage);
    },
    set(_, prop, value, receiver) {
        const result = createProperty(prop, value, receiver, options);
        return result;
    },
    setPrototypeOf() {
        throw new Error('Setting prototype is not allowed!');
    },
    // defineProperty(target: object, key: string, descriptor: object) {
    defineProperty() {
        throw new Error('Defining new Properties is not allowed!');
        // Reflect.defineProperty(target, key, descriptor);
    },
    deleteProperty() {
        throw new Error('Properties Deletion is not allowed!');
    },
    // getPrototypeOf() {
    // 	debugger;
    // 	throw new Error('Getting prototype is not allowed');
    // },
});
// user have to precisely define all props
const baseTarget = (_proto) => {
    const proto = typeof _proto === 'object' ? _proto : null;
    const answer = Object.create(proto);
    return answer;
};
exports.baseTarget = baseTarget;
exports.SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target, options) => {
    const target = Object.create(_target);
    const id = `TypeØmaticaProxyReference-${Math.random()}`;
    Object.defineProperty(target, exports.SymbolTypeomaticaProxyReference, {
        get() {
            return id;
        }
    });
    const handlers = createHandlers(options);
    const proxy = new Proxy(target, handlers);
    return proxy;
};
exports.BaseConstructorPrototype = function (_target, options) {
    if (!new.target) {
        const self = exports.BaseConstructorPrototype.bind(this, _target, options);
        self.prototype = {
            constructor: exports.BaseConstructorPrototype
        };
        // @ts-ignore
        return self;
    }
    // @ts-ignore
    if (this[exports.SymbolTypeomaticaProxyReference]) {
        // @ts-ignore
        return this;
    }
    const target = (0, exports.baseTarget)(_target);
    const InstancePrototype = getTypeomaticaProxyReference(target, options);
    let proto;
    let protoPointer = this;
    let protoConstrcutor;
    let constructors = false;
    // @ts-ignore
    // const hasProxyReference = protoPointer[SymbolTypeomaticaProxyReference] as unknown as boolean;
    // if (hasProxyReference) {
    // 	throw new Error('Multiple TypeØmatica instantiations are not allowed for the same Prototype Chain!');
    // }
    do {
        proto = protoPointer;
        protoPointer = Object.getPrototypeOf(proto);
        if (exports.BaseConstructorPrototype.prototype === protoPointer) {
            constructors = true;
            break;
        }
        if (!protoPointer)
            break;
        const descriptor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor');
        if (!descriptor)
            continue;
        const value = descriptor.value || descriptor.get;
        // if (!value) continue;
        protoConstrcutor = value;
    } while (protoConstrcutor !== exports.BaseConstructorPrototype);
    if (!constructors && protoConstrcutor !== exports.BaseConstructorPrototype) {
        throw new Error('Unable to setup TypeØmatica handler!');
    }
    Object.setPrototypeOf(proto, InstancePrototype);
    // @ts-ignore
    return this;
};
class BaseClass {
    constructor(_target, options) {
        // @ts-ignore
        if (this[exports.SymbolTypeomaticaProxyReference]) {
            return this;
        }
        const target = (0, exports.baseTarget)(_target);
        const proxy = getTypeomaticaProxyReference(target, options);
        let proto = this;
        let protoPointer;
        let found = false;
        do {
            protoPointer = Object.getPrototypeOf(proto);
            // if (protoPointer[SymbolTypeomaticaProxyReference]) {
            // 	throw new Error('Double TypeØmatica extension is not allowed!');
            // }
            if (protoPointer === Object.prototype) {
                found = true;
                break;
            }
            /*
            // it can be, that protoPointer === null
            // though too hard to implement this test
            */
            proto = protoPointer;
        } while (!found);
        Object.setPrototypeOf(proto, proxy);
    }
}
exports.BaseClass = BaseClass;
const strict = function (_target, options) {
    const decorator = function (cstr) {
        // @ts-ignore
        if (cstr.prototype[exports.SymbolTypeomaticaProxyReference]) {
            return cstr;
        }
        const target = (0, exports.baseTarget)(_target);
        const proxy = getTypeomaticaProxyReference(target, options);
        const _replacer = Object.create(proxy);
        // @ts-ignore
        Object.setPrototypeOf(cstr.prototype, _replacer);
        return cstr;
        // const MyClassProxy = new Proxy(cstr, {
        // 	construct(_, argumentsList, newTarget) {
        // 		debugger;
        // 		const target = baseTarget(_target);
        // 		const proxy = getTypeomaticaProxyReference(target);
        // 		const _replacer = Object.create(proxy);
        // 		const _proto = cstr.prototype;
        // 		const proto = Object.create(Object.getPrototypeOf(_proto));
        // 		proto.iAmProto = true;
        // 		Object.setPrototypeOf(cstr.prototype, proto);
        // 		const descriptors = Object.getOwnPropertyDescriptors(_proto);
        // 		Object.defineProperties(proto, descriptors);
        // 		const replacer = Object.create(_replacer);
        // 		Object.setPrototypeOf(proto, replacer);
        // 		Object.setPrototypeOf(cstr.prototype, proto);
        // 		const result = Reflect.construct(cstr, argumentsList, newTarget);
        // 		debugger;
        // 		Object.setPrototypeOf(cstr.prototype, _proto);
        // 		debugger;
        // 		return result;
        // 	},
        // });
        // return MyClassProxy;
    };
    return decorator;
};
exports.SymbolInitialValue = fields_js_1.FieldConstructor.SymbolInitialValue;
const FieldConstructorExport = fields_js_1.FieldConstructor;
exports.FieldConstructor = FieldConstructorExport;
exports.Strict = strict;
/* istanbul ignore next */
function setupCommonJS() {
    if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
        return;
    }
    Object.defineProperty(module, 'exports', {
        get() {
            return exports.BaseConstructorPrototype;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'BaseClass', {
        get() {
            return BaseClass;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'FieldConstructor', {
        get() {
            return fields_js_1.FieldConstructor;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'SymbolInitialValue', {
        get() {
            return exports.SymbolInitialValue;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'SymbolTypeomaticaProxyReference', {
        get() {
            return exports.SymbolTypeomaticaProxyReference;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'baseTarget', {
        get() {
            return exports.baseTarget;
        },
        enumerable: true
    });
    Object.defineProperty(module.exports, 'Strict', {
        get() {
            return strict;
        },
        enumerable: true
    });
}
setupCommonJS();
Object.freeze(exports.BaseConstructorPrototype);
Object.freeze(exports.BaseConstructorPrototype.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMENBQTBDO0FBQzFDLGdDQUFnQztBQUNoQyxZQUFZLENBQUM7OztBQUViLCtCQUErQjtBQUMvQiwyQ0FBMEM7QUFFMUMsK0NBTzBCO0FBRTFCLDJDQUErQztBQU0vQyxNQUFNLGNBQWMsR0FBRyxDQUFDLFVBQThCLEVBQUUsRUFBRSxFQUFFO0lBQzNELE1BQU0sRUFBRSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFOUMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3JCLFVBQVUsRUFBVixxQkFBVTtRQUNWLE9BQU8sRUFBUCxrQkFBTztRQUNQLE9BQU8sRUFBUCxrQkFBTztRQUNQLE9BQU8sRUFBUCxrQkFBTztRQUNQLFNBQVMsRUFBVCxvQkFBUztLQUNULENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtRQUMxQyxhQUFhO1FBQ2IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsWUFBb0IsRUFBRSxRQUFnQjtZQUMxRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdkMsT0FBTztnQkFDTixHQUFHO29CQUNGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztvQkFDNUIsSUFBSSxpQkFBaUIsSUFBSSxjQUFjLEtBQUssUUFBUSxFQUFFLENBQUM7d0JBQ3RELE1BQU0sSUFBSSxjQUFjLENBQUMsdUJBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDckQsQ0FBQztvQkFDRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQzdCLE9BQU8sTUFBTSxDQUFDO2dCQUNmLENBQUM7Z0JBQ0QsR0FBRyxDQUFDLGdCQUF5QjtvQkFDNUIsTUFBTSxjQUFj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QUMsT0FBTyxFQUFFLFlBQVksRUFBRTtRQUNuRCxHQUFHO1lBQ0YsT0FBTyxrQkFBVSxDQUFDO1FBQ25CLENBQUM7UUFDRCxVQUFVLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO1FBQy9DLEdBQUc7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFDRCxVQUFVLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsYUFBYSxFQUFFLENBQUM7QUFFaEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQ0FBd0IsQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0NBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBveGxpbnQtZGlzYWJsZSB0eXBlc2NyaXB0L25vLXRoaXMtYWxpYXNcbi8qIGVzbGludC1kaXNhYmxlIG5vLWRlYnVnZ2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGluc3BlY3QgfSBmcm9tICd1dGlsJztcbmltcG9ydCB7IEVycm9yc05hbWVzIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuXG5pbXBvcnQge1xuXHRmdW5jdGlvbnMsXG5cdG51bGxpc2gsXG5cdG9iamVjdHMsXG5cdHByaW1pdGl2ZXMsXG5cdHNwZWNpYWwsXG5cdGlzUHJpbWl0aXZlXG59IGZyb20gJy4vdHlwZXMvaW5kZXguanMnO1xuXG5pbXBvcnQgeyBGaWVsZENvbnN0cnVjdG9yIH0gZnJvbSAnLi9maWVsZHMuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVvbWF0aWNhT3B0aW9ucyB7XG5cdHN0cmljdEFjY2Vzc0NoZWNrPzogYm9vbGVhbjtcbn1cblxuY29uc3QgY3JlYXRlUmVzb2x2ZXIgPSAob3B0aW9uczogVHlwZW9tYXRpY2FPcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgeyBzdHJpY3RBY2Nlc3NDaGVjayA9IGZhbHNlIH0gPSBvcHRpb25zO1xuXHRcblx0cmV0dXJuIE9iamVjdC5lbnRyaWVzKHtcblx0XHRwcmltaXRpdmVzLFxuXHRcdHNwZWNpYWwsXG5cdFx0bnVsbGlzaCxcblx0XHRvYmplY3RzLFxuXHRcdGZ1bmN0aW9uc1xuXHR9KS5yZWR1Y2UoKG9iajogb2JqZWN0LCBba2V5LCBfaGFuZGxlcl0pID0+IHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0b2JqW2tleV0gPSBmdW5jdGlvbiAoaW5pdGlhbFZhbHVlOiBvYmplY3QsIHJlY2VpdmVyOiBvYmplY3QpIHtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBfaGFuZGxlcihpbml0aWFsVmFsdWUpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdGNvbnN0IGludm9jYXRpb25UaGlzID0gdGhpcztcblx0XHRcdFx0XHRpZiAoc3RyaWN0QWNjZXNzQ2hlY2sgJiYgaW52b2NhdGlvblRoaXMgIT09IHJlY2VpdmVyKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoRXJyb3JzTmFtZXMuQUNDRVNTX0RFTklFRCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGhhbmRsZXIuZ2V0KCk7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0KHJlcGxhY2VtZW50VmFsdWU6IHVua25vd24pIHtcblx0XHRcdFx0XHRjb25zdCBpbnZvY2F0aW9uVGhpcyA9IHRoaXM7XG5cdFx0XHRcdFx0aWYgKHN0cmljdEFjY2Vzc0NoZWNrICYmIGludm9jYXRpb25UaGlzICE9PSByZWNlaXZlcikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKEVycm9yc05hbWVzLkFDQ0VTU19ERU5JRUQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSBoYW5kbGVyLnNldChyZXBsYWNlbWVudFZhbHVlKTtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHRyZXR1cm4gb2JqO1xuXHR9LCB7fSk7XG59O1xuXG5jb25zdCBjcmVhdGVQcm9wZXJ0eSA9IChwcm9wTmFtZTogc3RyaW5nLCBpbml0aWFsVmFsdWU6IHVua25vd24sIHJlY2VpdmVyOiBvYmplY3QsIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpID0+IHtcblxuXHRjb25zdCB2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcblx0Y29uc3QgdmFsdWVJc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlKGluaXRpYWxWYWx1ZSk7XG5cdGNvbnN0IGlzT2JqZWN0ID0gdHlwZW9mIGluaXRpYWxWYWx1ZSA9PT0gJ29iamVjdCc7XG5cdGNvbnN0IGlzRnVuY3Rpb24gPSBpbml0aWFsVmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbjtcblx0Y29uc3QgaXNOdWxsID0gaW5pdGlhbFZhbHVlID09PSBudWxsO1xuXG5cdC8qKlxuXHQgKiBzcGVjaWFsOiB1bmRlZmluZWQgb3IgQmlnSW50IG9yIFN5bWJvbFxuXHQgKiBcdG9yIG90aGVyIG5vbiBjb25zdHJ1Y3RpYmxlIHR5cGVcblx0ICovXG5cblx0Y29uc3QgdHlwZXMgPSB2YWx1ZUlzUHJpbWl0aXZlID8gJ3ByaW1pdGl2ZXMnIDogKFxuXHRcdGlzT2JqZWN0ID8gKFxuXHRcdFx0aXNOdWxsID8gJ251bGxpc2gnIDogJ29iamVjdHMnXG5cdFx0KSA6IChcblx0XHRcdGlzRnVuY3Rpb24gPyAnZnVuY3Rpb25zJyA6ICdzcGVjaWFsJ1xuXHRcdClcblx0KTtcblxuXHRjb25zdCByZXNvbHZlciA9IGNyZWF0ZVJlc29sdmVyKG9wdGlvbnMpO1xuXG5cdGNvbnN0IGRlc2NyaXB0b3IgPSAoaXNPYmplY3QgJiYgKHZhbHVlIGluc3RhbmNlb2YgRmllbGRDb25zdHJ1Y3RvcikpID9cblx0XHR2YWx1ZSA6IHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHQuLi5yZXNvbHZlclt0eXBlc10odmFsdWUsIHJlY2VpdmVyKSxcblx0XHR9O1xuXG5cdC8vIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZpZWxkQ29uc3RydWN0b3IpIHtcblx0Ly8gXHRkZXNjcmlwdG9yO1xuXHQvLyBcdGRlYnVnZ2VyO1xuXHQvLyB9XG5cblx0Y29uc3QgcmVzdWx0ID0gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShyZWNlaXZlciwgcHJvcE5hbWUsIGRlc2NyaXB0b3IpO1xuXHRyZXR1cm4gcmVzdWx0O1xuXG59O1xuXG4vLyBsaW5lIGJlbG93ICdocmVmJyBpcyBmb3IgdXRpbC5pbnNwZWN0IHdvcmtzLCB1c2VmdWwgZm9yIHYyNFxuY29uc3QgcHJvcHMyc2tpcCA9IG5ldyBTZXQoW1xuXHRTeW1ib2wudG9TdHJpbmdUYWcsXG5cdFN5bWJvbC5pdGVyYXRvcixcblx0Ly8gU3ltYm9sLnRvUHJpbWl0aXZlLFxuXHQndG9TdHJpbmcnLFxuXHQndmFsdWVPZicsXG5cdCdocmVmJ1xuXSk7XG4vLyBjb25zdCBwcm9wczJza2lwID0gbmV3IFNldChbU3ltYm9sLnRvU3RyaW5nVGFnLCBTeW1ib2wuaXRlcmF0b3JdKTtcbmNvbnN0IGhhc05vZGVJbnNwZWN0ID0gKGluc3BlY3QgJiYgaW5zcGVjdC5jdXN0b20pO1xuLy8gb3hsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuKGhhc05vZGVJbnNwZWN0ICYmIChwcm9wczJza2lwLmFkZChpbnNwZWN0LmN1c3RvbSkpKTtcblxuY29uc3QgY3JlYXRlSGFuZGxlcnMgPSAob3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucykgPT4gKHtcblx0Z2V0KHRhcmdldDogb2JqZWN0LCBwcm9wOiBzdHJpbmcgfCBzeW1ib2wsIHJlY2VpdmVyOiBvYmplY3QpIHtcblx0XHRjb25zdCByZXN1bHQgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcblx0XHRpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGlmIChwcm9wID09PSAndG9KU09OJykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICh0aGlzOiB0eXBlb2YgdGFyZ2V0KSB7XG5cdFx0XHRcdGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzKTtcblx0XHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGVudHJpZXMucmVkdWNlKChvYmosIFtrZXksIHZhbHVlXSkgPT4ge1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvYmpba2V5XSA9IHZhbHVlLnZhbHVlT2YoKTtcblx0XHRcdFx0XHRyZXR1cm4gb2JqO1xuXHRcdFx0XHR9LCB7fSkpO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgeyBuYW1lIH0gPSByZWNlaXZlci5jb25zdHJ1Y3Rvcjtcblx0XHRpZiAocHJvcHMyc2tpcC5oYXMocHJvcCkpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgJHtuYW1lfSBsYWNrcyBkZWZpbml0aW9uIG9mIFsgJHtTdHJpbmcocHJvcCkudmFsdWVPZigpfSBdYDtcblx0XHRcdHJldHVybiBtZXNzYWdlO1xuXHRcdH1cblx0XHQvLyBjb25zdCBlcnJvck1lc3NhZ2UgPSBgJHtFcnJvcnNOYW1lcy5NSVNTSU5HX1BST1B9OiBbICR7U3RyaW5nKHByb3ApLnZhbHVlT2YoKX0gXSBmb3IgJHtuYW1lfWA7XG5cdFx0Ly8gdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG5cdH0sXG5cdHNldChfOiBvYmplY3QsIHByb3A6IHN0cmluZywgdmFsdWU6IHVua25vd24sIHJlY2VpdmVyOiBvYmplY3QpIHtcblx0XHRjb25zdCByZXN1bHQgPSBjcmVhdGVQcm9wZXJ0eShwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIsIG9wdGlvbnMpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdHNldFByb3RvdHlwZU9mKCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignU2V0dGluZyBwcm90b3R5cGUgaXMgbm90IGFsbG93ZWQhJyk7XG5cdH0sXG5cdC8vIGRlZmluZVByb3BlcnR5KHRhcmdldDogb2JqZWN0LCBrZXk6IHN0cmluZywgZGVzY3JpcHRvcjogb2JqZWN0KSB7XG5cdGRlZmluZVByb3BlcnR5KCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignRGVmaW5pbmcgbmV3IFByb3BlcnRpZXMgaXMgbm90IGFsbG93ZWQhJyk7XG5cdFx0Ly8gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgZGVzY3JpcHRvcik7XG5cdH0sXG5cdGRlbGV0ZVByb3BlcnR5KCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignUHJvcGVydGllcyBEZWxldGlvbiBpcyBub3QgYWxsb3dlZCEnKTtcblx0fSxcblx0Ly8gZ2V0UHJvdG90eXBlT2YoKSB7XG5cdC8vIFx0ZGVidWdnZXI7XG5cdC8vIFx0dGhyb3cgbmV3IEVycm9yKCdHZXR0aW5nIHByb3RvdHlwZSBpcyBub3QgYWxsb3dlZCcpO1xuXHQvLyB9LFxufSk7XG5cbi8vIHVzZXIgaGF2ZSB0byBwcmVjaXNlbHkgZGVmaW5lIGFsbCBwcm9wc1xuZXhwb3J0IGNvbnN0IGJhc2VUYXJnZXQgPSAoX3Byb3RvPzogb2JqZWN0KSA9PiB7XG5cdGNvbnN0IHByb3RvID0gdHlwZW9mIF9wcm90byA9PT0gJ29iamVjdCcgPyBfcHJvdG8gOiBudWxsO1xuXHRjb25zdCBhbnN3ZXIgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblx0cmV0dXJuIGFuc3dlcjtcbn07XG5cbmV4cG9ydCBjb25zdCBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlID0gU3ltYm9sKCdUeXBlw5htYXRpY2FQcm94eVJlZmVyZW5jZScpO1xuY29uc3QgZ2V0VHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSA9IChfdGFyZ2V0OiBvYmplY3QsIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpID0+IHtcblx0Y29uc3QgdGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZShfdGFyZ2V0KTtcblx0Y29uc3QgaWQgPSBgVHlwZcOYbWF0aWNhUHJveHlSZWZlcmVuY2UtJHtNYXRoLnJhbmRvbSgpfWA7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIFN5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gaWQ7XG5cdFx0fVxuXHR9KTtcblx0Y29uc3QgaGFuZGxlcnMgPSBjcmVhdGVIYW5kbGVycyhvcHRpb25zKTtcblx0Y29uc3QgcHJveHkgPSBuZXcgUHJveHkodGFyZ2V0LCBoYW5kbGVycyk7XG5cdHJldHVybiBwcm94eTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZSA9IGZ1bmN0aW9uIDxUIGV4dGVuZHMgb2JqZWN0LCBTIGV4dGVuZHMgVD4odGhpczogUyBleHRlbmRzIFQgPyBTIDoge30sIF90YXJnZXQ/OiBULCBvcHRpb25zPzogVHlwZW9tYXRpY2FPcHRpb25zICk6IFQge1xuXHRpZiAoIW5ldy50YXJnZXQpIHtcblxuXHRcdGNvbnN0IHNlbGY6IHtcblx0XHRcdHByb3RvdHlwZToge1xuXHRcdFx0XHRjb25zdHJ1Y3RvcjogdHlwZW9mIEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZVxuXHRcdFx0fVxuXHRcdFx0Ly9AdHMtaWdub3JlXG5cdFx0fSA9IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZS5iaW5kKHRoaXMsIF90YXJnZXQsIG9wdGlvbnMpO1xuXG5cdFx0c2VsZi5wcm90b3R5cGUgPSB7XG5cdFx0XHRjb25zdHJ1Y3RvcjogQmFzZUNvbnN0cnVjdG9yUHJvdG90eXBlXG5cdFx0fTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gc2VsZjtcblxuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRpZiAodGhpc1tTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSkge1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGNvbnN0IHRhcmdldCA9IGJhc2VUYXJnZXQoX3RhcmdldCkgYXMgb2JqZWN0O1xuXG5cdGNvbnN0IEluc3RhbmNlUHJvdG90eXBlID0gZ2V0VHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSh0YXJnZXQsIG9wdGlvbnMpO1xuXG5cdGxldCBwcm90bztcblx0bGV0IHByb3RvUG9pbnRlciA9IHRoaXMgYXMgb2JqZWN0O1xuXHRsZXQgcHJvdG9Db25zdHJjdXRvcjtcblxuXHRsZXQgY29uc3RydWN0b3JzID0gZmFsc2U7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHQvLyBjb25zdCBoYXNQcm94eVJlZmVyZW5jZSA9IHByb3RvUG9pbnRlcltTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSBhcyB1bmtub3duIGFzIGJvb2xlYW47XG5cdC8vIGlmIChoYXNQcm94eVJlZmVyZW5jZSkge1xuXHQvLyBcdHRocm93IG5ldyBFcnJvcignTXVsdGlwbGUgVHlwZcOYbWF0aWNhIGluc3RhbnRpYXRpb25zIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhlIHNhbWUgUHJvdG90eXBlIENoYWluIScpO1xuXHQvLyB9XG5cblx0ZG8ge1xuXHRcdHByb3RvID0gcHJvdG9Qb2ludGVyO1xuXHRcdHByb3RvUG9pbnRlciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG5cdFx0aWYgKEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZS5wcm90b3R5cGUgPT09IHByb3RvUG9pbnRlcikge1xuXHRcdFx0Y29uc3RydWN0b3JzID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpZiAoIXByb3RvUG9pbnRlcikgYnJlYWs7XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvUG9pbnRlciwgJ2NvbnN0cnVjdG9yJyk7XG5cdFx0aWYgKCFkZXNjcmlwdG9yKSBjb250aW51ZTtcblx0XHRjb25zdCB2YWx1ZSA9IGRlc2NyaXB0b3IudmFsdWUgfHwgZGVzY3JpcHRvci5nZXQ7XG5cdFx0Ly8gaWYgKCF2YWx1ZSkgY29udGludWU7XG5cdFx0cHJvdG9Db25zdHJjdXRvciA9IHZhbHVlO1xuXHR9IHdoaWxlIChwcm90b0NvbnN0cmN1dG9yICE9PSBCYXNlQ29uc3RydWN0b3JQcm90b3R5cGUpO1xuXG5cdGlmICghY29uc3RydWN0b3JzICYmIHByb3RvQ29uc3RyY3V0b3IgIT09IEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHNldHVwIFR5cGXDmG1hdGljYSBoYW5kbGVyIScpO1xuXHR9XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHByb3RvLCBJbnN0YW5jZVByb3RvdHlwZSk7XG5cdC8vIEB0cy1pZ25vcmVcblx0cmV0dXJuIHRoaXM7XG5cbn0gYXMge1xuXHRuZXc8VCBleHRlbmRzIG9iamVjdCB8IHt9PihfdGFyZ2V0PzogVCwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucyk6IFRcblx0PFQgZXh0ZW5kcyBvYmplY3QgfCB7fSwgUyBleHRlbmRzIFQ+KF90YXJnZXQ/OiBTIGV4dGVuZHMgaW5mZXIgSW5mZXJyZWRTID8gSW5mZXJyZWRTIDoge30sIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpOiBTXG59O1xuXG5leHBvcnQgY2xhc3MgQmFzZUNsYXNzIHtcblx0Y29uc3RydWN0b3IoX3RhcmdldD86IG9iamVjdCwgb3B0aW9ucz86IFR5cGVvbWF0aWNhT3B0aW9ucykge1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAodGhpc1tTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gYmFzZVRhcmdldChfdGFyZ2V0KSBhcyBvYmplY3Q7XG5cdFx0Y29uc3QgcHJveHkgPSBnZXRUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlKHRhcmdldCwgb3B0aW9ucyk7XG5cdFx0bGV0IHByb3RvOiBvYmplY3QgfCBudWxsID0gdGhpcztcblx0XHRsZXQgcHJvdG9Qb2ludGVyOiBvYmplY3QgfCBudWxsO1xuXHRcdGxldCBmb3VuZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRcdGRvIHtcblx0XHRcdHByb3RvUG9pbnRlciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG5cdFx0XHQvLyBpZiAocHJvdG9Qb2ludGVyW1N5bWJvbFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2VdKSB7XG5cdFx0XHQvLyBcdHRocm93IG5ldyBFcnJvcignRG91YmxlIFR5cGXDmG1hdGljYSBleHRlbnNpb24gaXMgbm90IGFsbG93ZWQhJyk7XG5cdFx0XHQvLyB9XG5cdFx0XHRpZiAocHJvdG9Qb2ludGVyID09PSBPYmplY3QucHJvdG90eXBlKSB7XG5cdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHQvKlxuXHRcdFx0Ly8gaXQgY2FuIGJlLCB0aGF0IHByb3RvUG9pbnRlciA9PT0gbnVsbFxuXHRcdFx0Ly8gdGhvdWdoIHRvbyBoYXJkIHRvIGltcGxlbWVudCB0aGlzIHRlc3Rcblx0XHRcdCovXG5cdFx0XHRwcm90byA9IHByb3RvUG9pbnRlcjtcblx0XHR9IHdoaWxlICghZm91bmQpO1xuXHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgcHJveHkpO1xuXHR9XG59XG5cblxuY29uc3Qgc3RyaWN0ID0gZnVuY3Rpb24gKF90YXJnZXQ/OiBvYmplY3QsIG9wdGlvbnM/OiBUeXBlb21hdGljYU9wdGlvbnMpIHtcblx0Y29uc3QgZGVjb3JhdG9yID0gZnVuY3Rpb248VD4oY3N0cjogVCk6IFQge1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmIChjc3RyLnByb3RvdHlwZVtTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlXSkge1xuXHRcdFx0cmV0dXJuIGNzdHI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gYmFzZVRhcmdldChfdGFyZ2V0KTtcblx0XHRjb25zdCBwcm94eSA9IGdldFR5cGVvbWF0aWNhUHJveHlSZWZlcmVuY2UodGFyZ2V0LCBvcHRpb25zKTtcblx0XHRjb25zdCBfcmVwbGFjZXIgPSBPYmplY3QuY3JlYXRlKHByb3h5KTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY3N0ci5wcm90b3R5cGUsIF9yZXBsYWNlcik7XG5cblx0XHRyZXR1cm4gY3N0cjtcblxuXG5cdFx0Ly8gY29uc3QgTXlDbGFzc1Byb3h5ID0gbmV3IFByb3h5KGNzdHIsIHtcblx0XHQvLyBcdGNvbnN0cnVjdChfLCBhcmd1bWVudHNMaXN0LCBuZXdUYXJnZXQpIHtcblx0XHQvLyBcdFx0ZGVidWdnZXI7XG5cdFx0Ly8gXHRcdGNvbnN0IHRhcmdldCA9IGJhc2VUYXJnZXQoX3RhcmdldCk7XG5cdFx0Ly8gXHRcdGNvbnN0IHByb3h5ID0gZ2V0VHlwZW9tYXRpY2FQcm94eVJlZmVyZW5jZSh0YXJnZXQpO1xuXHRcdC8vIFx0XHRjb25zdCBfcmVwbGFjZXIgPSBPYmplY3QuY3JlYXRlKHByb3h5KTtcblxuXHRcdC8vIFx0XHRjb25zdCBfcHJvdG8gPSBjc3RyLnByb3RvdHlwZTtcblxuXHRcdC8vIFx0XHRjb25zdCBwcm90byA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9wcm90bykpO1xuXHRcdC8vIFx0XHRwcm90by5pQW1Qcm90byA9IHRydWU7XG5cblx0XHQvLyBcdFx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNzdHIucHJvdG90eXBlLCBwcm90byk7XG5cblx0XHQvLyBcdFx0Y29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhfcHJvdG8pO1xuXHRcdC8vIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhwcm90bywgZGVzY3JpcHRvcnMpO1xuXG5cdFx0Ly8gXHRcdGNvbnN0IHJlcGxhY2VyID0gT2JqZWN0LmNyZWF0ZShfcmVwbGFjZXIpO1xuXHRcdC8vIFx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YocHJvdG8sIHJlcGxhY2VyKTtcblxuXG5cdFx0Ly8gXHRcdE9iamVjdC5zZXRQcm90b3R5cGVPZihjc3RyLnByb3RvdHlwZSwgcHJvdG8pO1xuXHRcdC8vIFx0XHRjb25zdCByZXN1bHQgPSBSZWZsZWN0LmNvbnN0cnVjdChjc3RyLCBhcmd1bWVudHNMaXN0LCBuZXdUYXJnZXQpO1xuXG5cdFx0Ly8gXHRcdGRlYnVnZ2VyO1xuXHRcdC8vIFx0XHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY3N0ci5wcm90b3R5cGUsIF9wcm90byk7XG5cdFx0Ly8gXHRcdGRlYnVnZ2VyO1xuXG5cdFx0Ly8gXHRcdHJldHVybiByZXN1bHQ7XG5cdFx0Ly8gXHR9LFxuXHRcdC8vIH0pO1xuXHRcdC8vIHJldHVybiBNeUNsYXNzUHJveHk7XG5cdH07XG5cblx0cmV0dXJuIGRlY29yYXRvcjtcblxufTtcbmV4cG9ydCBjb25zdCB7IFN5bWJvbEluaXRpYWxWYWx1ZSB9ID0gRmllbGRDb25zdHJ1Y3RvcjtcbmNvbnN0IEZpZWxkQ29uc3RydWN0b3JFeHBvcnQgPSBGaWVsZENvbnN0cnVjdG9yO1xuZXhwb3J0IHsgRmllbGRDb25zdHJ1Y3RvckV4cG9ydCBhcyBGaWVsZENvbnN0cnVjdG9yIH07XG5leHBvcnQgY29uc3QgU3RyaWN0ID0gc3RyaWN0O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gc2V0dXBDb21tb25KUygpIHtcblx0aWYgKHR5cGVvZiBtb2R1bGUgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgJ2V4cG9ydHMnLCB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnQmFzZUNsYXNzJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBCYXNlQ2xhc3M7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdGaWVsZENvbnN0cnVjdG9yJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBGaWVsZENvbnN0cnVjdG9yO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnU3ltYm9sSW5pdGlhbFZhbHVlJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBTeW1ib2xJbml0aWFsVmFsdWU7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsICdTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlJywge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiBTeW1ib2xUeXBlb21hdGljYVByb3h5UmVmZXJlbmNlO1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZS5leHBvcnRzLCAnYmFzZVRhcmdldCcsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gYmFzZVRhcmdldDtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ1N0cmljdCcsIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gc3RyaWN0O1xuXHRcdH0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcbn1cblxuc2V0dXBDb21tb25KUygpO1xuXG5PYmplY3QuZnJlZXplKEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZSk7XG5PYmplY3QuZnJlZXplKEJhc2VDb25zdHJ1Y3RvclByb3RvdHlwZS5wcm90b3R5cGUpO1xuIl19