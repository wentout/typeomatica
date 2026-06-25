'use strict';

export { functions } from './functions.js';
export { nullish } from './nullish.js';
export { objects } from './objects.js';
export { primitives } from './primitives.js';
export { special } from './special.js';

const PRIMITIVE_TYPES = [
	'string',
	'number',
	'boolean',
];

export const isPrimitive = (value: unknown) => {
	return PRIMITIVE_TYPES.includes(typeof value);
};
