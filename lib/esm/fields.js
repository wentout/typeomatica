'use strict';
import { ErrorsNames } from './errors.js';
const SymbolInitialValue = Symbol('Initial Value');
// export const FieldConstructor = function (this: FieldDefinition, value: unknown) {
// 	this[SymbolInitialValue] = value;
// } as ObjectConstructor;
export class FieldConstructor {
    [SymbolInitialValue];
    get get() {
        const self = this;
        return function ( /* this: FieldDefinition */) {
            return self[SymbolInitialValue];
        };
    }
    get set() {
        return function () {
            throw new TypeError(ErrorsNames.FORBIDDEN_RE);
        };
    }
    constructor(value) {
        this[SymbolInitialValue] = value;
    }
    static get SymbolInitialValue() {
        return SymbolInitialValue;
    }
}
// Object.assign(FieldConstructor.prototype, {
// 	configurable: false,
// 	enumerable: false,
// 	// writable: false
// })
// Object.defineProperty(FieldConstructor.prototype, 'get', {
// 	get() {
// 		return this[symbolValue];
// 	},
// 	// @ts-ignore
// 	set(value: unknown) {
// 		throw new Error('broken behaviour: assignment to getter');
// 	},
// 	configurable: false,
// 	enumerable: true,
// 	// writable: false
// });
// Object.defineProperty(FieldConstructor.prototype, 'set', {
// 	get() {
// 		return function (this: FieldDefinition, value: unknown) {
// 			this[symbolValue] = value;
// 		}
// 	},
// 	// @ts-ignore
// 	set(value: unknown) {
// 		throw new Error('broken behaviour: assignment to setter');
// 	},
// 	configurable: false,
// 	enumerable: true,
// 	// writable: false
// });
Object.freeze(FieldConstructor.prototype);
Object.seal(FieldConstructor.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZpZWxkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRTFDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBV25ELHFGQUFxRjtBQUNyRixxQ0FBcUM7QUFDckMsMEJBQTBCO0FBRTFCLE1BQU0sT0FBTyxnQkFBZ0I7SUFDNUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFVO0lBQzlCLElBQVcsR0FBRztRQUNiLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixPQUFPLFdBQVUsMkJBQTJCO1lBQzNDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUNELElBQVcsR0FBRztRQUNiLE9BQU87WUFDTixNQUFNLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUM7SUFDSCxDQUFDO0lBQ0QsWUFBYSxLQUFjO1FBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBQ0QsTUFBTSxLQUFLLGtCQUFrQjtRQUM1QixPQUFPLGtCQUFrQixDQUFDO0lBQzNCLENBQUM7Q0FDRDtBQUVELDhDQUE4QztBQUM5Qyx3QkFBd0I7QUFDeEIsc0JBQXNCO0FBQ3RCLHNCQUFzQjtBQUN0QixLQUFLO0FBRUwsNkRBQTZEO0FBQzdELFdBQVc7QUFDWCw4QkFBOEI7QUFDOUIsTUFBTTtBQUNOLGlCQUFpQjtBQUNqQix5QkFBeUI7QUFDekIsK0RBQStEO0FBQy9ELE1BQU07QUFDTix3QkFBd0I7QUFDeEIscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QixNQUFNO0FBRU4sNkRBQTZEO0FBQzdELFdBQVc7QUFDWCw4REFBOEQ7QUFDOUQsZ0NBQWdDO0FBQ2hDLE1BQU07QUFDTixNQUFNO0FBQ04saUJBQWlCO0FBQ2pCLHlCQUF5QjtBQUN6QiwrREFBK0Q7QUFDL0QsTUFBTTtBQUNOLHdCQUF3QjtBQUN4QixxQkFBcUI7QUFDckIsc0JBQXNCO0FBQ3RCLE1BQU07QUFFTixNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IEVycm9yc05hbWVzIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuXG5jb25zdCBTeW1ib2xJbml0aWFsVmFsdWUgPSBTeW1ib2woJ0luaXRpYWwgVmFsdWUnKTtcblxuaW50ZXJmYWNlIEZpZWxkRGVmaW5pdGlvbiAge1xuXHRbU3ltYm9sSW5pdGlhbFZhbHVlXTogdW5rbm93blxuXHQvLyBnZXQ/OiB1bmtub3duXG5cdC8vIHNldD86IHVua25vd25cblx0Ly8gY29uZmlndXJhYmxlOiBib29sZWFuLFxuXHQvLyBlbnVtZXJhYmxlOiBib29sZWFuLFxuXHQvLyB3cml0YWJsZTogYm9vbGVhblxufVxuXG4vLyBleHBvcnQgY29uc3QgRmllbGRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0aGlzOiBGaWVsZERlZmluaXRpb24sIHZhbHVlOiB1bmtub3duKSB7XG4vLyBcdHRoaXNbU3ltYm9sSW5pdGlhbFZhbHVlXSA9IHZhbHVlO1xuLy8gfSBhcyBPYmplY3RDb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGNsYXNzIEZpZWxkQ29uc3RydWN0b3IgaW1wbGVtZW50cyBGaWVsZERlZmluaXRpb24ge1xuXHRbU3ltYm9sSW5pdGlhbFZhbHVlXTogdW5rbm93bjtcblx0cHVibGljIGdldCBnZXQgKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoLyogdGhpczogRmllbGREZWZpbml0aW9uICovKSB7XG5cdFx0XHRyZXR1cm4gc2VsZltTeW1ib2xJbml0aWFsVmFsdWVdO1xuXHRcdH07XG5cdH1cblx0cHVibGljIGdldCBzZXQgKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKEVycm9yc05hbWVzLkZPUkJJRERFTl9SRSk7XG5cdFx0fTtcblx0fVxuXHRjb25zdHJ1Y3RvciAodmFsdWU6IHVua25vd24pIHtcblx0XHR0aGlzW1N5bWJvbEluaXRpYWxWYWx1ZV0gPSB2YWx1ZTtcblx0fVxuXHRzdGF0aWMgZ2V0IFN5bWJvbEluaXRpYWxWYWx1ZSAoKSB7XG5cdFx0cmV0dXJuIFN5bWJvbEluaXRpYWxWYWx1ZTtcblx0fVxufVxuXG4vLyBPYmplY3QuYXNzaWduKEZpZWxkQ29uc3RydWN0b3IucHJvdG90eXBlLCB7XG4vLyBcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vLyBcdGVudW1lcmFibGU6IGZhbHNlLFxuLy8gXHQvLyB3cml0YWJsZTogZmFsc2Vcbi8vIH0pXG5cbi8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGaWVsZENvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2dldCcsIHtcbi8vIFx0Z2V0KCkge1xuLy8gXHRcdHJldHVybiB0aGlzW3N5bWJvbFZhbHVlXTtcbi8vIFx0fSxcbi8vIFx0Ly8gQHRzLWlnbm9yZVxuLy8gXHRzZXQodmFsdWU6IHVua25vd24pIHtcbi8vIFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2Jyb2tlbiBiZWhhdmlvdXI6IGFzc2lnbm1lbnQgdG8gZ2V0dGVyJyk7XG4vLyBcdH0sXG4vLyBcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vLyBcdGVudW1lcmFibGU6IHRydWUsXG4vLyBcdC8vIHdyaXRhYmxlOiBmYWxzZVxuLy8gfSk7XG5cbi8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGaWVsZENvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ3NldCcsIHtcbi8vIFx0Z2V0KCkge1xuLy8gXHRcdHJldHVybiBmdW5jdGlvbiAodGhpczogRmllbGREZWZpbml0aW9uLCB2YWx1ZTogdW5rbm93bikge1xuLy8gXHRcdFx0dGhpc1tzeW1ib2xWYWx1ZV0gPSB2YWx1ZTtcbi8vIFx0XHR9XG4vLyBcdH0sXG4vLyBcdC8vIEB0cy1pZ25vcmVcbi8vIFx0c2V0KHZhbHVlOiB1bmtub3duKSB7XG4vLyBcdFx0dGhyb3cgbmV3IEVycm9yKCdicm9rZW4gYmVoYXZpb3VyOiBhc3NpZ25tZW50IHRvIHNldHRlcicpO1xuLy8gXHR9LFxuLy8gXHRjb25maWd1cmFibGU6IGZhbHNlLFxuLy8gXHRlbnVtZXJhYmxlOiB0cnVlLFxuLy8gXHQvLyB3cml0YWJsZTogZmFsc2Vcbi8vIH0pO1xuXG5PYmplY3QuZnJlZXplKEZpZWxkQ29uc3RydWN0b3IucHJvdG90eXBlKTtcbk9iamVjdC5zZWFsKEZpZWxkQ29uc3RydWN0b3IucHJvdG90eXBlKTtcbiJdfQ==