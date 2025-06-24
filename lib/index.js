'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Strict = exports.SymbolInitialValue = exports.FieldConstructor = exports.BaseClass = exports.BaseConstructorPrototype = void 0;
const errors_1 = require('./errors');
const types_1 = require('./types');
const fields_1 = require('./fields');
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
const props2skip = new Set([Symbol.toStringTag, Symbol.iterator, 'href']);
const util = require('util');
const hasNodeInspect = (util && util.inspect && util.inspect.custom);
hasNodeInspect && (props2skip.add(util.inspect.custom));
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
		if (props2skip.has(prop)) {
			return undefined;
		}
		throw new Error(`${errors_1.ErrorsNames.MISSING_PROP}: [ ${String(prop).valueOf()} ] of ${receiver.constructor.name}`);
	},
	set(_, prop, value, receiver) {
		const result = createProperty(prop, value, receiver);
		return result;
	},
};
const BaseTarget = Object.create(null);
exports.BaseConstructorPrototype = function (InstanceTarget = BaseTarget) {
	if (!new.target) {
		const self = exports.BaseConstructorPrototype.bind(this, InstanceTarget);
		self.prototype = {
			constructor: exports.BaseConstructorPrototype
		};
		return self;
	}
	const InstancePrototype = new Proxy(InstanceTarget, handlers);
	let protoPointer = this;
	let protoConstrcutor;
	do {
		protoPointer = Reflect.getPrototypeOf(protoPointer);
		protoConstrcutor = Reflect.getOwnPropertyDescriptor(protoPointer, 'constructor').value;
	} while (protoConstrcutor !== exports.BaseConstructorPrototype);
	Reflect.setPrototypeOf(protoPointer, InstancePrototype);
	return this;
};
Object.defineProperty(module, 'exports', {
	get() {
		return exports.BaseConstructorPrototype;
	},
	enumerable: true
});
class BaseClass extends exports.BaseConstructorPrototype {
}
exports.BaseClass = BaseClass;
var fields_2 = require('./fields');
Object.defineProperty(exports, 'FieldConstructor', { enumerable: true, get: function () { return fields_2.FieldConstructor; } });
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
Object.defineProperty(module.exports, 'Strict', {
	get() {
		return function (prototypeTarget) {
			const decorator = function (Target) {
				const Targeted = exports.BaseConstructorPrototype.call(Target, prototypeTarget);
				const MyProxyClass = new Proxy(Targeted, {
					construct(target, argumentsList, newTarget) {
						const result = Reflect.construct(target, argumentsList, newTarget);
						return result;
					},
				});
				return MyProxyClass;
			};
			return decorator;
		};
	},
	enumerable: true
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYixxQ0FBdUM7QUFFdkMsbUNBT2lCO0FBRWpCLHFDQUE0QztBQUU1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQy9CLFVBQVUsRUFBVixrQkFBVTtJQUNWLE9BQU8sRUFBUCxlQUFPO0lBQ1AsT0FBTyxFQUFQLGVBQU87SUFDUCxPQUFPLEVBQVAsZUFBTztJQUNQLFNBQVMsRUFBVCxpQkFBUztDQUNULENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtJQUUxQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxZQUFvQixFQUFFLFFBQWdCO1FBQzFELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2QyxPQUFPO1lBQ04sR0FBRztnQkFDRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLElBQUksY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUksY0FBYyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7WUFDRCxHQUFHLENBQUMsZ0JBQXlCO2dCQUM1QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLElBQUksY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUksY0FBYyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FB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