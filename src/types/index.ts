'use strict';

export { functions } from './functions';
export { nullish } from './nullish';
export { objects } from './objects';
export { primitives } from './primitives';
export { special } from './special';

const PRIMITIVE_TYPES = [
	'string',
	'number',
	'boolean',
];

export const isPrimitive = (value: unknown) => {
	return PRIMITIVE_TYPES.includes(typeof value);
};
