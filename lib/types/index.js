'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrimitive = exports.special = exports.primitives = exports.objects = exports.nullish = exports.functions = void 0;
var functions_1 = require("./functions");
Object.defineProperty(exports, "functions", { enumerable: true, get: function () { return functions_1.functions; } });
var nullish_1 = require("./nullish");
Object.defineProperty(exports, "nullish", { enumerable: true, get: function () { return nullish_1.nullish; } });
var objects_1 = require("./objects");
Object.defineProperty(exports, "objects", { enumerable: true, get: function () { return objects_1.objects; } });
var primitives_1 = require("./primitives");
Object.defineProperty(exports, "primitives", { enumerable: true, get: function () { return primitives_1.primitives; } });
var special_1 = require("./special");
Object.defineProperty(exports, "special", { enumerable: true, get: function () { return special_1.special; } });
const PRIMITIVE_TYPES = [
    'string',
    'number',
    'boolean',
];
const isPrimitive = (value) => {
    return PRIMITIVE_TYPES.includes(typeof value);
};
exports.isPrimitive = isPrimitive;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYix5Q0FBd0M7QUFBL0Isc0dBQUEsU0FBUyxPQUFBO0FBQ2xCLHFDQUFvQztBQUEzQixrR0FBQSxPQUFPLE9BQUE7QUFDaEIscUNBQW9DO0FBQTNCLGtHQUFBLE9BQU8sT0FBQTtBQUNoQiwyQ0FBMEM7QUFBakMsd0dBQUEsVUFBVSxPQUFBO0FBQ25CLHFDQUFvQztBQUEzQixrR0FBQSxPQUFPLE9BQUE7QUFFaEIsTUFBTSxlQUFlLEdBQUc7SUFDdkIsUUFBUTtJQUNSLFFBQVE7SUFDUixTQUFTO0NBQ1QsQ0FBQztBQUVLLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDN0MsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDO0FBRlcsUUFBQSxXQUFXLGVBRXRCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgeyBmdW5jdGlvbnMgfSBmcm9tICcuL2Z1bmN0aW9ucyc7XG5leHBvcnQgeyBudWxsaXNoIH0gZnJvbSAnLi9udWxsaXNoJztcbmV4cG9ydCB7IG9iamVjdHMgfSBmcm9tICcuL29iamVjdHMnO1xuZXhwb3J0IHsgcHJpbWl0aXZlcyB9IGZyb20gJy4vcHJpbWl0aXZlcyc7XG5leHBvcnQgeyBzcGVjaWFsIH0gZnJvbSAnLi9zcGVjaWFsJztcblxuY29uc3QgUFJJTUlUSVZFX1RZUEVTID0gW1xuXHQnc3RyaW5nJyxcblx0J251bWJlcicsXG5cdCdib29sZWFuJyxcbl07XG5cbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZTogdW5rbm93bikgPT4ge1xuXHRyZXR1cm4gUFJJTUlUSVZFX1RZUEVTLmluY2x1ZGVzKHR5cGVvZiB2YWx1ZSk7XG59O1xuIl19