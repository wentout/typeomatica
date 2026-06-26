'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isPrimitive = exports.special = exports.primitives = exports.objects = exports.nullish = exports.functions = void 0;
var functions_js_1 = require('./functions.js');
Object.defineProperty(exports, 'functions', { enumerable: true, get: function () { return functions_js_1.functions; } });
var nullish_js_1 = require('./nullish.js');
Object.defineProperty(exports, 'nullish', { enumerable: true, get: function () { return nullish_js_1.nullish; } });
var objects_js_1 = require('./objects.js');
Object.defineProperty(exports, 'objects', { enumerable: true, get: function () { return objects_js_1.objects; } });
var primitives_js_1 = require('./primitives.js');
Object.defineProperty(exports, 'primitives', { enumerable: true, get: function () { return primitives_js_1.primitives; } });
var special_js_1 = require('./special.js');
Object.defineProperty(exports, 'special', { enumerable: true, get: function () { return special_js_1.special; } });
const PRIMITIVE_TYPES = [
	'string',
	'number',
	'boolean',
];
const isPrimitive = (value) => {
	return PRIMITIVE_TYPES.includes(typeof value);
};
exports.isPrimitive = isPrimitive;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYiwrQ0FBMkM7QUFBbEMseUdBQUEsU0FBUyxPQUFBO0FBQ2xCLDJDQUF1QztBQUE5QixxR0FBQSxPQUFPLE9BQUE7QUFDaEIsMkNBQXVDO0FBQTlCLHFHQUFBLE9BQU8sT0FBQTtBQUNoQixpREFBNkM7QUFBcEMsMkdBQUEsVUFBVSxPQUFBO0FBQ25CLDJDQUF1QztBQUE5QixxR0FBQSxPQUFPLE9BQUE7QUFFaEIsTUFBTSxlQUFlLEdBQUc7SUFDdkIsUUFBUTtJQUNSLFFBQVE7SUFDUixTQUFTO0NBQ1QsQ0FBQztBQUVLLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDN0MsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDO0FBRlcsUUFBQSxXQUFXLGVBRXRCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgeyBmdW5jdGlvbnMgfSBmcm9tICcuL2Z1bmN0aW9ucy5qcyc7XG5leHBvcnQgeyBudWxsaXNoIH0gZnJvbSAnLi9udWxsaXNoLmpzJztcbmV4cG9ydCB7IG9iamVjdHMgfSBmcm9tICcuL29iamVjdHMuanMnO1xuZXhwb3J0IHsgcHJpbWl0aXZlcyB9IGZyb20gJy4vcHJpbWl0aXZlcy5qcyc7XG5leHBvcnQgeyBzcGVjaWFsIH0gZnJvbSAnLi9zcGVjaWFsLmpzJztcblxuY29uc3QgUFJJTUlUSVZFX1RZUEVTID0gW1xuXHQnc3RyaW5nJyxcblx0J251bWJlcicsXG5cdCdib29sZWFuJyxcbl07XG5cbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZTogdW5rbm93bikgPT4ge1xuXHRyZXR1cm4gUFJJTUlUSVZFX1RZUEVTLmluY2x1ZGVzKHR5cGVvZiB2YWx1ZSk7XG59O1xuIl19