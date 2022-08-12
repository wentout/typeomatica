'use strict';

import { ErrorsNames } from '../errors';

export const primitives = (initialValue: object) => {
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