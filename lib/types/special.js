'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.special = void 0;
const errors_1 = require("../errors");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlY2lhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9zcGVjaWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHLENBQUMsZ0JBQXdCO1lBQzNCLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUM5QyxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkQsTUFBTSxLQUFLLENBQUM7UUFDYixDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUMsQ0FBQztBQWRXLFFBQUEsT0FBTyxXQWNsQiIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgRXJyb3JzTmFtZXMgfSBmcm9tICcuLi9lcnJvcnMnO1xuXG5leHBvcnQgY29uc3Qgc3BlY2lhbCA9ICh2YWx1ZTogb2JqZWN0KSA9PiB7XG5cdHJldHVybiB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH0sXG5cdFx0c2V0KHJlcGxhY2VtZW50VmFsdWU6IG9iamVjdCkge1xuXHRcdFx0aWYgKHR5cGVvZiByZXBsYWNlbWVudFZhbHVlID09PSB0eXBlb2YgdmFsdWUpIHtcblx0XHRcdFx0dmFsdWUgPSByZXBsYWNlbWVudFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBlcnJvciA9IG5ldyBUeXBlRXJyb3IoRXJyb3JzTmFtZXMuVFlQRV9NSVNNQVRDSCk7XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9XG5cdH07XG59OyJdfQ==