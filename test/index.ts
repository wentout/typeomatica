'use strict';

// BasePrototype & BaseClass are the same function
// go as you want for being meaningfull
// or meaningless

const BasePrototype = require('..');
import { BaseClass }  from '..';

class Base extends BasePrototype({
	additionalProp: 321
}) {
	numberValue = 123;
	constructor() {
		super();
		this.stringValue = '123';
		this.booleanValue = true;
		this.objectValue = {};
	}
};

const baseInstance = new Base;


class SimpleBase extends BaseClass {
	stringProp = '123';
};

const simpleInstance = new SimpleBase;

describe('props tests', () => {

	test('simple instance works & strings too', () => {
		expect(simpleInstance.stringProp.toString()).toBe('123');
		expect(simpleInstance.stringProp.length).toBe(3);
		expect(/String$/.test(simpleInstance.stringProp.constructor.name)).toBe(true);
		expect(() => {

			// @ts-ignore
			simpleInstance.stringProp = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});

	test('correct boolean comparison with type coercion', () => {
		expect(() => {

			const { booleanValue } = baseInstance;
			booleanValue != false;

		}).toThrow();
	});

	test('fails boolean arithmetics', () => {
		expect(() => {

			baseInstance.booleanValue + 5;

		}).toThrow();
	});

	test('correct boolean assignment', () => {

		baseInstance.booleanValue = new Boolean(false);
		const value = baseInstance.booleanValue.valueOf();
		expect(value).toEqual(false);

	});

	test('correct boolean constructor', () => {
		expect(baseInstance.booleanValue).toBeInstanceOf(Boolean);
	});

	test('correct object assignment', () => {
		baseInstance.objectValue = { a: 123 };
		expect(baseInstance.objectValue.a).toEqual(123);
	});

	test('wrong assignment to objects', () => {

		expect(() => {

			baseInstance.objectValue = 123;

		}).toThrow(new TypeError('Type Mismatch'));

		expect(() => {

			baseInstance.objectValue = new Set();

		}).toThrow(new TypeError('Type Mismatch'));

	});

	test('fails number arithmetics', () => {
		expect(() => {

			baseInstance.numberValue + 5;

		}).toThrow();
	});

	test('correct number arithmetics using .valueOf()', () => {

		const result = baseInstance.numberValue.valueOf() + 5;
		expect(result).toEqual(128);

	});

	test('correct number value', () => {
		expect(baseInstance.numberValue.toString()).toBe('123');
		expect(/Number$/.test(baseInstance.numberValue.constructor.name)).toBe(true);
	});


	test('wrong assignment', () => {
		expect(() => {

			baseInstance.booleanValue = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});

	test('correct null value', () => {
		baseInstance.nullValue = null;
		expect(baseInstance.nullValue).toEqual(null);
	});

	test('any assignment to null value', () => {
		expect(() => {

			baseInstance.nullValue = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});


	test('correct undefined value', () => {
		baseInstance.undefinedValue = undefined;
		expect(baseInstance.undefinedValue).toEqual(undefined);
	});

	test('wrong assignment to undefined value', () => {
		expect(() => {

			baseInstance.undefinedValue = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});

	test('correct BigInt value', () => {
		baseInstance.BigIntValue = BigInt(1);
		expect(baseInstance.BigIntValue).toEqual(BigInt(1));
	});

	test('correct assignment to BigInt value', () => {
		baseInstance.BigIntValue = BigInt(2);
		expect(baseInstance.BigIntValue).toEqual(BigInt(2));
	});

	test('wrong assignment to BigInt value', () => {
		expect(() => {

			baseInstance.BigIntValue = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});

	test('correct Symbol value', () => {
		baseInstance.SymbolValue = Symbol('test');
		expect(typeof baseInstance.SymbolValue).toEqual('symbol');
	});

	test('wrong assignment to BigInt value', () => {
		expect(() => {

			baseInstance.SymbolValue = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});

	test('correct prototype correction', () => {
		expect(baseInstance.additionalProp).toEqual(321);
		expect(baseInstance.toString).toBeInstanceOf(Function);
	});

	test('missing value fails', () => {
		expect(() => {

			baseInstance.missingValue > 1;

		}).toThrow(new TypeError('Attempt to Access to Undefined Prop'));
	});

});
