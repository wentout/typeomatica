'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.special = void 0;
const errors_1 = require('../errors');
const special = (value) => {
	return {
		get() {
			return value;
		},
		set(replacementValue) {
			if (typeof replacementValue === typeof value) {
				value = replacementValue;
				return value;
			}
			const error = new TypeError(errors_1.ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	};
};
exports.special = special;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlY2lhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9zcGVjaWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHLENBQUMsZ0JBQXdCO1lBQzNCLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUM5QyxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkQsTUFBTSxLQUFLLENBQUM7UUFDYixDQUFDO0tBQ0QsQ0FBQTtBQUNGLENBQUMsQ0FBQztBQWRXLFFBQUEsT0FBTyxXQWNsQiJ9