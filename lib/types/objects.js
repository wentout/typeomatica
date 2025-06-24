'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.objects = void 0;
const errors_1 = require('../errors');
const objects = (value) => {
	return {
		get() {
			return value;
		},
		set(replacementValue) {
			if (replacementValue instanceof Object && replacementValue.constructor === value.constructor) {
				value = replacementValue;
				return value;
			}
			const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	};
};
exports.objects = objects;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9vYmplY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHLENBQUMsZ0JBQXlCO1lBQzVCLElBQUksZ0JBQWdCLFlBQVksTUFBTSxJQUFJLGdCQUFnQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlGLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQztnQkFDekIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsb0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFBO0FBQ0YsQ0FBQyxDQUFDO0FBZFcsUUFBQSxPQUFPLFdBY2xCIn0=