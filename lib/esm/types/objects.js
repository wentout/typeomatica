'use strict';
import { ErrorsNames } from '../errors.js';
export const objects = (value) => {
    return {
        get() {
            return value;
        },
        set(replacementValue) {
            if (replacementValue instanceof Object && replacementValue.constructor === value.constructor) {
                value = replacementValue;
                return value;
            }
            const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
            throw error;
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90eXBlcy9vYmplY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFM0MsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDeEMsT0FBTztRQUNOLEdBQUc7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxHQUFHLENBQUMsZ0JBQXlCO1lBQzVCLElBQUksZ0JBQWdCLFlBQVksTUFBTSxJQUFJLGdCQUFnQixDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlGLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQztnQkFDekIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sS0FBSyxDQUFDO1FBQ2IsQ0FBQztLQUNELENBQUM7QUFDSCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IEVycm9yc05hbWVzIH0gZnJvbSAnLi4vZXJyb3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IG9iamVjdHMgPSAodmFsdWU6IG9iamVjdCkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9LFxuXHRcdHNldChyZXBsYWNlbWVudFZhbHVlOiB1bmtub3duKSB7XG5cdFx0XHRpZiAocmVwbGFjZW1lbnRWYWx1ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiByZXBsYWNlbWVudFZhbHVlLmNvbnN0cnVjdG9yID09PSB2YWx1ZS5jb25zdHJ1Y3Rvcikge1xuXHRcdFx0XHR2YWx1ZSA9IHJlcGxhY2VtZW50VmFsdWU7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGVycm9yID0gbmV3IFR5cGVFcnJvcihFcnJvcnNOYW1lcy5UWVBFX01JU01BVENIKTtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH1cblx0fTtcbn07Il19