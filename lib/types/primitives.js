'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitives = void 0;
const errors_js_1 = require("../errors.js");
const primitives = (initialValue) => {
    let value = Object(initialValue);
    const initialType = typeof initialValue;
    return {
        get() {
            const proxyAsValue = new Proxy(value, {
                // get(target, prop, receiver) {
                get(_, prop) {
                    if (prop === Symbol.toPrimitive) {
                        return function (hint) {
                            if (hint !== initialType) {
                                throw new ReferenceError(errors_js_1.ErrorsNames.ACCESS_DENIED);
                            }
                            return value.valueOf();
                        };
                    }
                    if (prop === 'valueOf') {
                        return function () {
                            return value.valueOf();
                        };
                    }
                    // @ts-ignore
                    if (value[prop] instanceof Function) {
                        return value[prop].bind(value);
                    }
                    const answer = value[prop];
                    return answer;
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
            const error = new TypeError(errors_js_1.ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
exports.primitives = primitives;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9wcmltaXRpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsNENBQTJDO0FBRXBDLE1BQU0sVUFBVSxHQUFHLENBQUMsWUFBb0IsRUFBRSxFQUFFO0lBQ2xELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxPQUFPLFlBQVksQ0FBQztJQUV4QyxPQUFPO1FBQ04sR0FBRztZQUNGLE1BQU0sWUFBWSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDckMsZ0NBQWdDO2dCQUNoQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUk7b0JBQ1YsSUFBSSxJQUFJLEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUNqQyxPQUFPLFVBQVUsSUFBWTs0QkFDNUIsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFLENBQUM7Z0NBQzFCLE1BQU0sSUFBSSxjQUFjLENBQUMsdUJBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDckQsQ0FBQzs0QkFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDeEIsQ0FBQyxDQUFDO29CQUNILENBQUM7b0JBRUQsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQ3hCLE9BQU87NEJBQ04sT0FBTyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3hCLENBQUMsQ0FBQztvQkFDSCxDQUFDO29CQUVELGFBQWE7b0JBQ2IsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFFLENBQUM7d0JBQ3JDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDaEMsQ0FBQztvQkFFRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzNCLE9BQU8sTUFBTSxDQUFDO2dCQUNmLENBQUM7YUFDRCxDQUFDLENBQUM7WUFDSCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBQ0QsVUFBVTtRQUNWLDJCQUEyQjtRQUMzQiw2QkFBNkI7UUFDN0IsMEJBQTBCO1FBQzFCLDJEQUEyRDtRQUMzRCxRQUFRO1FBQ1IsTUFBTTtRQUNOLE1BQU07UUFDTixpREFBaUQ7UUFDakQsYUFBYTtRQUNiLHlCQUF5QjtRQUN6QixLQUFLO1FBQ0wsR0FBRyxDQUFDLGdCQUF5QjtZQUM1QixJQUFJLGdCQUFnQixZQUFZLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkQsS0FBSyxHQUFHLGdCQUFnQixDQUFDO2dCQUN6QixPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUUxQyxJQUFJLFFBQVEsWUFBWSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzNDLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQ2pCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLHVCQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkQsTUFBTSxLQUFLLENBQUM7UUFDYixDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUMsQ0FBQztBQWhFVyxRQUFBLFVBQVUsY0FnRXJCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBFcnJvcnNOYW1lcyB9IGZyb20gJy4uL2Vycm9ycy5qcyc7XG5cbmV4cG9ydCBjb25zdCBwcmltaXRpdmVzID0gKGluaXRpYWxWYWx1ZTogb2JqZWN0KSA9PiB7XG5cdGxldCB2YWx1ZSA9IE9iamVjdChpbml0aWFsVmFsdWUpO1xuXHRjb25zdCBpbml0aWFsVHlwZSA9IHR5cGVvZiBpbml0aWFsVmFsdWU7XG5cblx0cmV0dXJuIHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCBwcm94eUFzVmFsdWUgPSBuZXcgUHJveHkodmFsdWUsIHtcblx0XHRcdFx0Ly8gZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcblx0XHRcdFx0Z2V0KF8sIHByb3ApIHtcblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gU3ltYm9sLnRvUHJpbWl0aXZlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKGhpbnQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRpZiAoaGludCAhPT0gaW5pdGlhbFR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoRXJyb3JzTmFtZXMuQUNDRVNTX0RFTklFRCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLnZhbHVlT2YoKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHByb3AgPT09ICd2YWx1ZU9mJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLnZhbHVlT2YoKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGlmICh2YWx1ZVtwcm9wXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWVbcHJvcF0uYmluZCh2YWx1ZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgYW5zd2VyID0gdmFsdWVbcHJvcF07XG5cdFx0XHRcdFx0cmV0dXJuIGFuc3dlcjtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJveHlBc1ZhbHVlO1xuXHRcdH0sXG5cdFx0Ly8gZ2V0KCkge1xuXHRcdC8vIFx0Y29uc3QgcHJlcGFyZWRWYWx1ZSA9IHtcblx0XHQvLyBcdFx0W1N5bWJvbC50b1ByaW1pdGl2ZV0oKSB7XG5cdFx0Ly8gXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHQvLyBcdFx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihFcnJvcnNOYW1lcy5BQ0NFU1NfREVOSUVEKTtcblx0XHQvLyBcdFx0XHR9O1xuXHRcdC8vIFx0XHR9XG5cdFx0Ly8gXHR9O1xuXHRcdC8vIFx0UmVmbGVjdC5zZXRQcm90b3R5cGVPZihwcmVwYXJlZFZhbHVlLCB2YWx1ZSk7XG5cdFx0Ly8gXHRkZWJ1Z2dlcjtcblx0XHQvLyBcdHJldHVybiBwcmVwYXJlZFZhbHVlO1xuXHRcdC8vIH0sXG5cdFx0c2V0KHJlcGxhY2VtZW50VmFsdWU6IHVua25vd24pIHtcblx0XHRcdGlmIChyZXBsYWNlbWVudFZhbHVlIGluc3RhbmNlb2YgdmFsdWUuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0dmFsdWUgPSByZXBsYWNlbWVudFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHByZXZhbHVlID0gT2JqZWN0KHJlcGxhY2VtZW50VmFsdWUpO1xuXG5cdFx0XHRpZiAocHJldmFsdWUgaW5zdGFuY2VvZiB2YWx1ZS5jb25zdHJ1Y3Rvcikge1xuXHRcdFx0XHR2YWx1ZSA9IHByZXZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGVycm9yID0gbmV3IFR5cGVFcnJvcihFcnJvcnNOYW1lcy5UWVBFX01JU01BVENIKTtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH1cblx0fTtcbn07Il19