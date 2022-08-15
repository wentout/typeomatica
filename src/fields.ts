'use strict';

export const SymbolInitialValue = Symbol('Initial Value');

import { ErrorsNames } from './errors'

interface FieldDefinition  {
	[SymbolInitialValue]: unknown
	// get?: unknown
	// set?: unknown
	// configurable: boolean,
	// enumerable: boolean,
	// writable: boolean
}

// export const FieldConstructor = function (this: FieldDefinition, value: unknown) {
// 	this[SymbolInitialValue] = value;
// } as ObjectConstructor;

export class FieldConstructor implements FieldDefinition {
	[SymbolInitialValue]: unknown
	public get get () {
		const self = this;
		return function (this: FieldDefinition) {
			return self[SymbolInitialValue];
		}
	}
	public get set () {
		return function () {
			throw new TypeError(ErrorsNames.FORBIDDEN_RE);
		}
	}
	constructor (value: unknown) {
		this[SymbolInitialValue] = value;
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
