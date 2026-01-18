'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitives = void 0;
const errors_1 = require("../errors");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9wcmltaXRpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsc0NBQXdDO0FBRWpDLE1BQU0sVUFBVSxHQUFHLENBQUMsWUFBb0IsRUFBRSxFQUFFO0lBQ2xELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxPQUFPLFlBQVksQ0FBQztJQUV4QyxPQUFPO1FBQ04sR0FBRztZQUNGLE1BQU0sWUFBWSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFFckMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJO29CQUNWLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDakMsT0FBTyxVQUFVLElBQVk7NEJBQzVCLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dDQUMxQixNQUFNLElBQUksY0FBYyxDQUFDLG9CQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQ3JELENBQUM7NEJBQ0QsT0FBTyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3hCLENBQUMsQ0FBQztvQkFDSCxDQUFDO29CQUVELElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO3dCQUN4QixPQUFPOzRCQUNOLE9BQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUN4QixDQUFDLENBQUM7b0JBQ0gsQ0FBQztvQkFHRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUUsQ0FBQzt3QkFDckMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoQyxDQUFDO29CQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsT0FBTyxNQUFNLENBQUM7Z0JBQ2YsQ0FBQzthQUNELENBQUMsQ0FBQztZQUNILE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFhRCxHQUFHLENBQUMsZ0JBQXlCO1lBQzVCLElBQUksZ0JBQWdCLFlBQVksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuRCxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRTFDLElBQUksUUFBUSxZQUFZLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDM0MsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsb0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBaEVXLFFBQUEsVUFBVSxjQWdFckIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IEVycm9yc05hbWVzIH0gZnJvbSAnLi4vZXJyb3JzJztcblxuZXhwb3J0IGNvbnN0IHByaW1pdGl2ZXMgPSAoaW5pdGlhbFZhbHVlOiBvYmplY3QpID0+IHtcblx0bGV0IHZhbHVlID0gT2JqZWN0KGluaXRpYWxWYWx1ZSk7XG5cdGNvbnN0IGluaXRpYWxUeXBlID0gdHlwZW9mIGluaXRpYWxWYWx1ZTtcblxuXHRyZXR1cm4ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IHByb3h5QXNWYWx1ZSA9IG5ldyBQcm94eSh2YWx1ZSwge1xuXHRcdFx0XHQvLyBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuXHRcdFx0XHRnZXQoXywgcHJvcCkge1xuXHRcdFx0XHRcdGlmIChwcm9wID09PSBTeW1ib2wudG9QcmltaXRpdmUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoaGludDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChoaW50ICE9PSBpbml0aWFsVHlwZSkge1xuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihFcnJvcnNOYW1lcy5BQ0NFU1NfREVOSUVEKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUudmFsdWVPZigpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gJ3ZhbHVlT2YnKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUudmFsdWVPZigpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0aWYgKHZhbHVlW3Byb3BdIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZVtwcm9wXS5iaW5kKHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBhbnN3ZXIgPSB2YWx1ZVtwcm9wXTtcblx0XHRcdFx0XHRyZXR1cm4gYW5zd2VyO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm94eUFzVmFsdWU7XG5cdFx0fSxcblx0XHQvLyBnZXQoKSB7XG5cdFx0Ly8gXHRjb25zdCBwcmVwYXJlZFZhbHVlID0ge1xuXHRcdC8vIFx0XHRbU3ltYm9sLnRvUHJpbWl0aXZlXSgpIHtcblx0XHQvLyBcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdC8vIFx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKEVycm9yc05hbWVzLkFDQ0VTU19ERU5JRUQpO1xuXHRcdC8vIFx0XHRcdH07XG5cdFx0Ly8gXHRcdH1cblx0XHQvLyBcdH07XG5cdFx0Ly8gXHRSZWZsZWN0LnNldFByb3RvdHlwZU9mKHByZXBhcmVkVmFsdWUsIHZhbHVlKTtcblx0XHQvLyBcdGRlYnVnZ2VyO1xuXHRcdC8vIFx0cmV0dXJuIHByZXBhcmVkVmFsdWU7XG5cdFx0Ly8gfSxcblx0XHRzZXQocmVwbGFjZW1lbnRWYWx1ZTogdW5rbm93bikge1xuXHRcdFx0aWYgKHJlcGxhY2VtZW50VmFsdWUgaW5zdGFuY2VvZiB2YWx1ZS5jb25zdHJ1Y3Rvcikge1xuXHRcdFx0XHR2YWx1ZSA9IHJlcGxhY2VtZW50VmFsdWU7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcHJldmFsdWUgPSBPYmplY3QocmVwbGFjZW1lbnRWYWx1ZSk7XG5cblx0XHRcdGlmIChwcmV2YWx1ZSBpbnN0YW5jZW9mIHZhbHVlLmNvbnN0cnVjdG9yKSB7XG5cdFx0XHRcdHZhbHVlID0gcHJldmFsdWU7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZXJyb3IgPSBuZXcgVHlwZUVycm9yKEVycm9yc05hbWVzLlRZUEVfTUlTTUFUQ0gpO1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fVxuXHR9O1xufTsiXX0=