'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.objects = void 0;
const errors_1 = require("../errors");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9vYmplY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHLENBQUMsZ0JBQXlCO1lBQzVCLElBQUksZ0JBQWdCLFlBQVksTUFBTSxJQUFJLGdCQUFnQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlGLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQztnQkFDekIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsb0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBZFcsUUFBQSxPQUFPLFdBY2xCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBFcnJvcnNOYW1lcyB9IGZyb20gJy4uL2Vycm9ycyc7XG5cbmV4cG9ydCBjb25zdCBvYmplY3RzID0gKHZhbHVlOiBvYmplY3QpID0+IHtcblx0cmV0dXJuIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSxcblx0XHRzZXQocmVwbGFjZW1lbnRWYWx1ZTogdW5rbm93bikge1xuXHRcdFx0aWYgKHJlcGxhY2VtZW50VmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgcmVwbGFjZW1lbnRWYWx1ZS5jb25zdHJ1Y3RvciA9PT0gdmFsdWUuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0dmFsdWUgPSByZXBsYWNlbWVudFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBlcnJvciA9IG5ldyBUeXBlRXJyb3IoRXJyb3JzTmFtZXMuVFlQRV9NSVNNQVRDSCk7XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9XG5cdH07XG59OyJdfQ==