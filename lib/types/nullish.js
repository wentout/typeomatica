'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.nullish = void 0;
const errors_1 = require('../errors');
const nullish = (value) => {
	return {
		get() {
			return value;
		},
		set() {
			const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	};
};
exports.nullish = nullish;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9udWxsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHO1lBQ0YsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsb0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFBO0FBQ0YsQ0FBQyxDQUFDO0FBVlcsUUFBQSxPQUFPLFdBVWxCIn0=