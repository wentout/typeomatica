'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullish = void 0;
const errors_1 = require("../errors");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9udWxsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHO1lBQ0YsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsb0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBVlcsUUFBQSxPQUFPLFdBVWxCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBFcnJvcnNOYW1lcyB9IGZyb20gJy4uL2Vycm9ycyc7XG5cbmV4cG9ydCBjb25zdCBudWxsaXNoID0gKHZhbHVlOiBvYmplY3QpID0+IHtcblx0cmV0dXJuIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSxcblx0XHRzZXQoKSB7XG5cdFx0XHRjb25zdCBlcnJvciA9IG5ldyBUeXBlRXJyb3IoRXJyb3JzTmFtZXMuVFlQRV9NSVNNQVRDSCk7XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9XG5cdH07XG59OyJdfQ==