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
