'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldConstructor = void 0;
const errors_1 = require("./errors");
const SymbolInitialValue = Symbol('Initial Value');
class FieldConstructor {
    get get() {
        const self = this;
        return function () {
            return self[SymbolInitialValue];
        };
    }
    get set() {
        return function () {
            throw new TypeError(errors_1.ErrorsNames.FORBIDDEN_RE);
        };
    }
    constructor(value) {
        this[SymbolInitialValue] = value;
    }
    static get SymbolInitialValue() {
        return SymbolInitialValue;
    }
}
exports.FieldConstructor = FieldConstructor;
Object.freeze(FieldConstructor.prototype);
Object.seal(FieldConstructor.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZpZWxkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHFDQUF1QztBQUV2QyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQWVuRCxNQUFhLGdCQUFnQjtJQUU1QixJQUFXLEdBQUc7UUFDYixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsT0FBTztZQUNOLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUNELElBQVcsR0FBRztRQUNiLE9BQU87WUFDTixNQUFNLElBQUksU0FBUyxDQUFDLG9CQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUNELFlBQWEsS0FBYztRQUMxQixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUNELE1BQU0sS0FBSyxrQkFBa0I7UUFDNUIsT0FBTyxrQkFBa0IsQ0FBQztJQUMzQixDQUFDO0NBQ0Q7QUFuQkQsNENBbUJDO0FBb0NELE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyJ9