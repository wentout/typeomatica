'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.primitives = void 0;
const errors_1 = require('../errors');
const primitives = (initialValue) => {
	let value = Object(initialValue);
	const initialType = typeof initialValue;
	return {
		get() {
			const proxyAsValue = new Proxy(value, {
				get(_, prop) {
					if (prop === Symbol.toPrimitive) {
						return function (hint) {
							if (hint !== initialType) {
								throw new ReferenceError(errors_1.ErrorsNames.ACCESS_DENIED);
							}
							return value.valueOf();
						};
					}
					if (prop === 'valueOf') {
						return function () {
							return value.valueOf();
						};
					}
					if (value[prop] instanceof Function) {
						return value[prop].bind(value);
					}
					const answer = value[prop];
					return answer;
				}
			});
			return proxyAsValue;
		},
		set(replacementValue) {
			if (replacementValue instanceof value.constructor) {
				value = replacementValue;
				return value;
			}
			const prevalue = Object(replacementValue);
			if (prevalue instanceof value.constructor) {
				value = prevalue;
				return value;
			}
			const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	};
};
exports.primitives = primitives;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9wcmltaXRpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sVUFBVSxHQUFHLENBQUMsWUFBb0IsRUFBRSxFQUFFO0lBQ2xELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxPQUFPLFlBQVksQ0FBQztJQUV4QyxPQUFPO1FBQ04sR0FBRztZQUNGLE1BQU0sWUFBWSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFFckMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJO29CQUNWLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDakMsT0FBTyxVQUFVLElBQVk7NEJBQzVCLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dDQUMxQixNQUFNLElBQUksY0FBYyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQ3JELENBQUM7NEJBQ0QsT0FBTyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3hCLENBQUMsQ0FBQTtvQkFDRixDQUFDO29CQUVELElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUN4QixPQUFPOzRCQUNOLE9BQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUN4QixDQUFDLENBQUE7b0JBQ0YsQ0FBQztvQkFHRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUUsQ0FBQzt3QkFDckMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoQyxDQUFDO29CQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsT0FBTyxNQUFNLENBQUM7Z0JBQ2YsQ0FBQzthQUNELENBQUMsQ0FBQztZQUNILE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFhRCxHQUFHLENBQUMsZ0JBQXlCO1lBQzVCLElBQUksZ0JBQWdCLFlBQVksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuRCxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRTFDLElBQUksUUFBUSxZQUFZLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0MsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsb0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBaEVXLFFBQUEsVUFBVSxjQWdFckIifQ==