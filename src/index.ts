'use strict';

const ErrorsNames = {
	TYPE_MISMATCH: 'Type Mismatch',
	ACCESS_DENIED: 'Value Access Denied',
	MISSING_PROP: 'Attempt to Access to Undefined Prop',
	RIP_FUNCTIONS: 'Functions are Restricted'
};

const PRIMITIVE_TYPES = [
	'string',
	'number',
	'boolean',
];

const isPrimitive = (value: unknown) => {
	return PRIMITIVE_TYPES.includes(typeof value);
};

const primitives = (initialValue: object) => {
	let value = Object(initialValue);
	const initialType = typeof initialValue;

	return {
		get() {
			const proxyAsValue = new Proxy(value, {
				// get(target, prop, receiver) {
				get(_, prop) {

					if (prop === Symbol.toPrimitive) {
						return function (hint: string) {
							if (hint !== initialType) {
								throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
							}
							return value.valueOf();
						}
					}

					if (prop === 'valueOf') {
						return function () {
							return value.valueOf();
						}
					}

					// @ts-ignore
					if (value[prop] instanceof Function) {
						return value[prop].bind(value);
					}

					return value[prop];
				}
			});
			return proxyAsValue;
		},
		// get() {
		// 	const preparedValue = {
		// 		[Symbol.toPrimitive]() {
		// 			return function () {
		// 				throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
		// 			};
		// 		}
		// 	};
		// 	Reflect.setPrototypeOf(preparedValue, value);
		// 	debugger;
		// 	return preparedValue;
		// },
		set(replacementValue: unknown) {
			if (replacementValue instanceof value.constructor) {
				value = replacementValue;
				return value;
			}

			const prevalue = Object(replacementValue);

			if (prevalue instanceof value.constructor) {
				value = prevalue;
				return value;
			}

			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	};
};

const special = (value: object) => {
	return {
		get() {
			return value;
		},
		set(replacementValue: object) {
			if (typeof replacementValue === typeof value) {
				value = replacementValue;
				return value;

			}
			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	}
};

const nullish = (value: object) => {
	return {
		get() {
			return value;
		},
		set() {
			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	}
};

const objects = (value: object) => {
	return {
		get() {
			return value;
		},
		set(replacementValue: unknown) {
			if (replacementValue instanceof Object && replacementValue.constructor === value.constructor) {
				value = replacementValue;
				return value;
			}
			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	}
};

const functions = () => {
	throw new TypeError(ErrorsNames.RIP_FUNCTIONS);
};

const resolver = Object.entries({
	primitives,
	special,
	nullish,
	objects,
	functions
}).reduce((obj: object, [key, _handler]) => {
	// @ts-ignore
	obj[key] = function (initialValue: object, receiver: object) {
		const handler = _handler(initialValue);
		return {
			get() {
				const invocationThis = this;
				if (invocationThis !== receiver) {
					throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
				}
				return handler.get();
			},
			set(replacementValue: unknown) {
				const invocationThis = this;
				if (invocationThis !== receiver) {
					throw new ReferenceError(ErrorsNames.ACCESS_DENIED);
				}
				return handler.set(replacementValue);
			}
		}
	};

	return obj;
}, {});

const createProperty = (propName: string, initialValue: any, receiver: object) => {

	const value = initialValue;
	const valueIsPrimitive = isPrimitive(initialValue);
	const isObject = typeof initialValue === 'object';
	const isFunction = initialValue instanceof Function;
	const isNull = initialValue === null;

	const type = valueIsPrimitive ? 'primitives' : (
		isObject ? (
			isNull ? 'nullish' : 'objects'
		) : (
			isFunction ? 'functions' : 'special'));

	// @ts-ignore
	const descriptor = resolver[type](value, receiver);

	const result = Reflect.defineProperty(receiver, propName, {
		...descriptor,
		enumerable: true
	});

	return result;
};


const handlers = {
	get(target: object, prop: string, receiver: object) {
		const result = Reflect.get(target, prop, receiver);
		if (result !== undefined) {
			return result;
		}
		throw new Error(ErrorsNames.MISSING_PROP);
	},
	set(_: object, prop: string, value: unknown, receiver: object) {
		const result = createProperty(prop, value, receiver);
		return result;
	}
};

// user have to precisely define all props
const BaseTarget = Object.create(null);

const BasePrototype = new Proxy(BaseTarget, handlers);

// export type IDEF = {
// 	new(...args: any[]): object;
// 	(this: object, ...args: any[]): object;
// 	prototype: object;
// }

// @ts-ignore
const BaseConstructor = function (this: object, InstanceTarget = BaseTarget) {
	if (!new.target) {
		return function () {
			// @ts-ignore
			return new BaseConstructor(InstanceTarget);
		};
	}
	const InstancePrototype = new Proxy(InstanceTarget, handlers);
	Reflect.setPrototypeOf(this, InstancePrototype);
} as ObjectConstructor;
// } as IDEF;

Reflect.setPrototypeOf(BaseConstructor.prototype, BasePrototype);

Object.defineProperty(module, 'exports', {
	get() {
		return BaseConstructor;
	},
	enumerable: true
});

// @ts-ignore
export class BaseClass extends BaseConstructor { };

Object.defineProperty(module.exports, 'BaseClass', {
	get() {
		return BaseClass;
	},
	enumerable: true
});