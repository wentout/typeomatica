'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strict = exports.SymbolInitialValue = exports.FieldConstructor = exports.BaseClass = exports.BaseConstructorPrototype = exports.SymbolTypeomaticaProxyReference = void 0;
const errors_1 = require("./errors");
const types_1 = require("./types");
const fields_1 = require("./fields");
const resolver = Object.entries({
    primitives: types_1.primitives,
    special: types_1.special,
    nullish: types_1.nullish,
    objects: types_1.objects,
    functions: types_1.functions
}).reduce((obj, [key, _handler]) => {
    obj[key] = function (initialValue, receiver) {
        const handler = _handler(initialValue);
        return {
            get() {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
                }
                const result = handler.get();
                return result;
            },
            set(replacementValue) {
                const invocationThis = this;
                if (invocationThis !== receiver) {
                    throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
                }
                const result = handler.set(replacementValue);
                return result;
            }
        };
    };
    return obj;
}, {});
const createProperty = (propName, initialValue, receiver) => {
    const value = initialValue;
    const valueIsPrimitive = (0, types_1.isPrimitive)(initialValue);
    const isObject = typeof initialValue === 'object';
    const isFunction = initialValue instanceof Function;
    const isNull = initialValue === null;
    const type = valueIsPrimitive ? 'primitives' : (isObject ? (isNull ? 'nullish' : 'objects') : (isFunction ? 'functions' : 'special'));
    const descriptor = (isObject && (value instanceof fields_1.FieldConstructor)) ?
        value
        : Object.assign({ enumerable: true }, resolver[type](value, receiver));
    const result = Reflect.defineProperty(receiver, propName, descriptor);
    return result;
};
const props2skip = new Set([
    Symbol.toStringTag,
    Symbol.iterator,
    'toString',
    'valueOf',
    'href'
]);
const util = require('util');
const hasNodeInspect = (util && util.inspect && util.inspect.custom);
(hasNodeInspect && (props2skip.add(util.inspect.custom)));
const handlers = {
    get(target, prop, receiver) {
        const result = Reflect.get(target, prop, receiver);
        if (result !== undefined) {
            return result;
        }
        if (prop === 'toJSON') {
            return function () {
                const entries = Object.entries(this);
                return JSON.stringify(entries.reduce((obj, [key, value]) => {
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
        const errorMessage = `${errors_1.ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] for ${name}`;
        throw new Error(errorMessage);
    },
    set(_, prop, value, receiver) {
        const result = createProperty(prop, value, receiver);
        return result;
    },
    defineProperty() {
        throw new Error('defineProperty is not allowed');
    },
    setPrototypeOf() {
        throw new Error('Setting prototype is not allowed');
    },
};
Object.freeze(handlers);
const baseTarget = (proto = null) => {
    const answer = Object.create(proto);
    return answer;
};
exports.SymbolTypeomaticaProxyReference = Symbol('TypeØmaticaProxyReference');
const getTypeomaticaProxyReference = (_target) => {
    const target = Object.create(_target);
    const id = `TypeØmaticaProxyReference-${Math.random()}`;
    Object.defineProperty(target, exports.SymbolTypeomaticaProxyReference, {
        get() {
            return id;
        }
    });
    const proxy = new Proxy(target, handlers);
    return proxy;
};
exports.BaseConstructorPrototype = function (_target = null) {
    if (!new.target) {
        const self = exports.BaseConstructorPrototype.bind(this, _target);
        self.prototype = {
            constructor: exports.BaseConstructorPrototype
        };
        return self;
    }
    if (this[exports.SymbolTypeomaticaProxyReference]) {
        return this;
    }
    const target = baseTarget(_target);
    const InstancePrototype = getTypeomaticaProxyReference(target);
    let proto;
    let protoPointer = this;
    let protoConstrcutor;
    let constructors = false;
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
        protoConstrcutor = value;
    } while (protoConstrcutor !== exports.BaseConstructorPrototype);
    if (!constructors && protoConstrcutor !== exports.BaseConstructorPrototype) {
        throw new Error('Unable to setup TypeØmatica handler!');
    }
    Object.setPrototypeOf(proto, InstancePrototype);
    return this;
};
Object.defineProperty(module, 'exports', {
    get() {
        return exports.BaseConstructorPrototype;
    },
    enumerable: true
});
class BaseClass {
    constructor(_target = null) {
        if (this[exports.SymbolTypeomaticaProxyReference]) {
            return this;
        }
        const target = baseTarget(_target);
        const proxy = getTypeomaticaProxyReference(target);
        let proto = this;
        let protoPointer = Object.getPrototypeOf(this);
        let found = false;
        do {
            protoPointer = Object.getPrototypeOf(proto);
            if (protoPointer === Object.prototype) {
                found = true;
                break;
            }
            if (protoPointer === null) {
                found = true;
                break;
            }
            proto = protoPointer;
        } while (!found);
        Object.setPrototypeOf(proto, proxy);
    }
}
exports.BaseClass = BaseClass;
var fields_2 = require("./fields");
Object.defineProperty(exports, "FieldConstructor", { enumerable: true, get: function () { return fields_2.FieldConstructor; } });
exports.SymbolInitialValue = fields_1.FieldConstructor.SymbolInitialValue;
exports.Strict = {
    Strict: exports.BaseConstructorPrototype,
}.Strict;
Object.defineProperty(module.exports, 'BaseClass', {
    get() {
        return BaseClass;
    },
    enumerable: true
});
Object.defineProperty(module.exports, 'FieldConstructor', {
    get() {
        return fields_1.FieldConstructor;
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
Object.defineProperty(module.exports, 'Strict', {
    get() {
        return function (_target = null) {
            const decorator = function (cstr) {
                debugger;
                if (cstr.prototype[exports.SymbolTypeomaticaProxyReference]) {
                    return cstr;
                }
                const target = baseTarget(_target);
                const proxy = getTypeomaticaProxyReference(target);
                const _replacer = Object.create(proxy);
                Object.setPrototypeOf(cstr.prototype, _replacer);
                return cstr;
            };
            return decorator;
        };
    },
    enumerable: true
});
Object.freeze(exports.BaseConstructorPrototype);
Object.freeze(exports.BaseConstructorPrototype.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsWUFBWSxDQUFDOzs7QUFFYixxQ0FBdUM7QUFFdkMsbUNBT2lCO0FBRWpCLHFDQUE0QztBQUU1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQy9CLFVBQVUsRUFBVixrQkFBVTtJQUNWLE9BQU8sRUFBUCxlQUFPO0lBQ1AsT0FBTyxFQUFQLGVBQU87SUFDUCxPQUFPLEVBQVAsZUFBTztJQUNQLFNBQVMsRUFBVCxpQkFBUztDQUNULENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtJQUUxQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxZQUFvQixFQUFFLFFBQWdCO1FBQzFELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2QyxPQUFPO1lBQ04sR0FBRztnQkFDRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLElBQUksY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUksY0FBYyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7WUFDRCxHQUFHLENBQUMsZ0JBQXlCO2dCQUM1QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLElBQUksY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUksY0FBYyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM3QyxPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFUCxNQUFNLGNBQWMsR0FBRyxDQUFDLFFBQWdCLEVBQUUsWUFBcUIsRUFBRSxRQUFnQixFQUFFLEVBQUU7SUFFcEYsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDO0lBQzNCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxtQkFBVyxFQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ25ELE1BQU0sUUFBUSxHQUFHLE9BQU8sWUFBWSxLQUFLLFFBQVEsQ0FBQztJQUNsRCxNQUFNLFVBQVUsR0FBRyxZQUFZLFlBQVksUUFBUSxDQUFDO0lBQ3BELE1BQU0sTUFBTSxHQUFHLFlBQVksS0FBSyxJQUFJLENBQUM7SUFPckMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FDOUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUNWLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQzlCLENBQUMsQ0FBQyxDQUFDLENBQ0gsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDcEMsQ0FDRCxDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxLQUFLLFlBQVkseUJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsS0FBSztRQUNMLENBQUMsaUJBRUEsVUFBVSxFQUFFLElBQUksSUFFYixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUNsQyxDQUFDO0lBT0gsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RFLE9BQU8sTUFBTSxDQUFDO0FBRWYsQ0FBQyxDQUFDO0FBR0YsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDMUIsTUFBTSxDQUFDLFdBQVc7SUFDbEIsTUFBTSxDQUFDLFFBQVE7SUFFZixVQUFVO0lBQ1YsU0FBUztJQUNULE1BQU07Q0FDTixDQUFDLENBQUM7QUFFSCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxjQUFjLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXJFLENBQUMsY0FBYyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUUxRCxNQUFNLFFBQVEsR0FBRztJQUNoQixHQUFHLENBQUMsTUFBYyxFQUFFLElBQXFCLEVBQUUsUUFBZ0I7UUFDMUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzFCLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUNELElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBRXZCLE9BQU87Z0JBQ04sTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtvQkFFMUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDM0IsT0FBTyxHQUFHLENBQUM7Z0JBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFDdEMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxJQUFJLDBCQUEwQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQztZQUM1RSxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxZQUFZLEdBQUcsR0FBRyxvQkFBVyxDQUFDLFlBQVksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDOUYsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQVMsRUFBRSxJQUFZLEVBQUUsS0FBYyxFQUFFLFFBQWdCO1FBQzVELE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVELGNBQWM7UUFFYixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFFbEQsQ0FBQztJQUtELGNBQWM7UUFFYixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUNELENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBS3hCLE1BQU0sVUFBVSxHQUFHLENBQUMsUUFBdUIsSUFBSSxFQUFFLEVBQUU7SUFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVwQyxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVXLFFBQUEsK0JBQStCLEdBQUcsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDbkYsTUFBTSw0QkFBNEIsR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFO0lBQ3hELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEMsTUFBTSxFQUFFLEdBQUcsNkJBQTZCLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO0lBQ3hELE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLHVDQUErQixFQUFFO1FBQzlELEdBQUc7WUFDRixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRCxDQUFDLENBQUM7SUFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDLENBQUM7QUFHVyxRQUFBLHdCQUF3QixHQUFHLFVBV3ZDLFVBQW9CLElBQUk7SUFFeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVqQixNQUFNLElBQUksR0FLTixnQ0FBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDaEIsV0FBVyxFQUFFLGdDQUF3QjtTQUNyQyxDQUFDO1FBRUYsT0FBTyxJQUFTLENBQUM7SUFFbEIsQ0FBQztJQUdELElBQUksSUFBSSxDQUFDLHVDQUErQixDQUFDLEVBQUUsQ0FBQztRQUMzQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFXLENBQUM7SUFFN0MsTUFBTSxpQkFBaUIsR0FBRyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUvRCxJQUFJLEtBQUssQ0FBQztJQUNWLElBQUksWUFBWSxHQUFHLElBQWMsQ0FBQztJQUNsQyxJQUFJLGdCQUFnQixDQUFDO0lBRXJCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztJQVF6QixHQUFHLENBQUM7UUFDSCxLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQ3JCLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksZ0NBQXdCLENBQUMsU0FBUyxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQ3pELFlBQVksR0FBRyxJQUFJLENBQUM7WUFDcEIsTUFBTTtRQUNQLENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWTtZQUFFLE1BQU07UUFDekIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsVUFBVTtZQUFFLFNBQVM7UUFDMUIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDO1FBRWpELGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDLFFBQVEsZ0JBQWdCLEtBQUssZ0NBQXdCLEVBQUU7SUFFeEQsSUFBSSxDQUFDLFlBQVksSUFBSSxnQkFBZ0IsS0FBSyxnQ0FBd0IsRUFBRSxDQUFDO1FBQ3BFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNoRCxPQUFPLElBQUksQ0FBQztBQUViLENBR0MsQ0FBQztBQTZDRixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7SUFDeEMsR0FBRztRQUVGLE9BQU8sZ0NBQXdCLENBQUM7SUFDakMsQ0FBQztJQUNELFVBQVUsRUFBRSxJQUFJO0NBQ2hCLENBQUMsQ0FBQztBQUVILE1BQWEsU0FBUztJQUNyQixZQUFZLFVBQXlCLElBQUk7UUFFeEMsSUFBSSxJQUFJLENBQUMsdUNBQStCLENBQUMsRUFBRSxDQUFDO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQVcsQ0FBQztRQUM3QyxNQUFNLEtBQUssR0FBRyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLEtBQUssR0FBWSxLQUFLLENBQUM7UUFDM0IsR0FBRyxDQUFDO1lBQ0gsWUFBWSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFJNUMsSUFBSSxZQUFZLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN2QyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLE1BQU07WUFDUCxDQUFDO1lBQ0QsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzNCLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2IsTUFBTTtZQUNQLENBQUM7WUFDRCxLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQ3RCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtRQUNqQixNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBQ0Q7QUE5QkQsOEJBOEJDO0FBRUQsbUNBQTRDO0FBQW5DLDBHQUFBLGdCQUFnQixPQUFBO0FBQ1YsMEJBQWtCLEdBQUsseUJBQWdCLG9CQUFDO0FBT3hDLGNBQU0sR0FBSztJQUN6QixNQUFNLEVBQUUsZ0NBQXdCO0NBSWhDLFFBQUM7QUFFRixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFO0lBQ2xELEdBQUc7UUFDRixPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBQ0QsVUFBVSxFQUFFLElBQUk7Q0FDaEIsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFO0lBQ3pELEdBQUc7UUFDRixPQUFPLHlCQUFnQixDQUFDO0lBQ3pCLENBQUM7SUFDRCxVQUFVLEVBQUUsSUFBSTtDQUNoQixDQUFDLENBQUM7QUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUU7SUFDM0QsR0FBRztRQUNGLE9BQU8sMEJBQWtCLENBQUM7SUFDM0IsQ0FBQztJQUNELFVBQVUsRUFBRSxJQUFJO0NBQ2hCLENBQUMsQ0FBQztBQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxpQ0FBaUMsRUFBRTtJQUN4RSxHQUFHO1FBQ0YsT0FBTyx1Q0FBK0IsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsVUFBVSxFQUFFLElBQUk7Q0FDaEIsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtJQUMvQyxHQUFHO1FBQ0YsT0FBTyxVQUFVLFVBQXlCLElBQUk7WUFDN0MsTUFBTSxTQUFTLEdBQUcsVUFBa0QsSUFBTztnQkFDMUUsUUFBUSxDQUFDO2dCQUdULElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyx1Q0FBK0IsQ0FBQyxFQUFFLENBQUM7b0JBQ3JELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLEtBQUssR0FBRyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUVqRCxPQUFPLElBQUksQ0FBQztZQW1DYixDQUFDLENBQUM7WUFFRixPQUFPLFNBQVMsQ0FBQztRQUVsQixDQUFDLENBQUM7SUFDSCxDQUFDO0lBQ0QsVUFBVSxFQUFFLElBQUk7Q0FDaEIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQ0FBd0IsQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0NBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMifQ==