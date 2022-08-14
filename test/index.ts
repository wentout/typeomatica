'use strict';

// BasePrototype & BaseClass are the same function
// go as you want for being meaningfull
// or meaningless

const BasePrototype = require('..');
// @ts-ignore
import { BaseClass, IDEF, FieldConstructor } from '..';

debugger;

class Base extends BasePrototype({
	additionalProp: 321,
	someMethod() {
		return this.numberValue.valueOf();
	},
}) {
	numberValue = 123;

	get getterField() {
		return '123';
	}

	set setterField(value: string) {
		this.stringValue = value;
	}

	constructor() {
		super();
		this.stringValue = '123';
		this.booleanValue = true;
		this.objectValue = {};
	}
}
const baseInstance = new Base;

const upperInstance = Object.create(baseInstance);

class SimpleBase extends BaseClass {
	stringProp = '123';
};
const simpleInstance = new SimpleBase;

type MyFunctionalConstructorInstance = {
	stringProp: string
};

const MyFunctionalConstructor = function () {
	// @ts-ignore
	this.stringProp = '123';
} as IDEF<MyFunctionalConstructorInstance>;

Reflect.setPrototypeOf(MyFunctionalConstructor.prototype, new BasePrototype);

const myFunctionalInstance = new MyFunctionalConstructor();

class SecondaryExtend extends Base { second = 123 };
class TripleExtend extends SecondaryExtend { };
const tiripleExtendInstance = new TripleExtend;

class NetworkedExtention extends BasePrototype(tiripleExtendInstance) { };

const networkedInstance = new NetworkedExtention;

class ExtendedArray extends BasePrototype([1, 2, 3]) { };
class ExtendedSet extends BasePrototype(new Set([1, 2, 3])) { };

const extendedArrayInstance = new ExtendedArray;
const extendedSetInstance = new ExtendedSet;

const MUTATION_VALUE = -2;


class MyFieldConstructor extends FieldConstructor {
	constructor(value: string) {
		super(value);
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		Reflect.defineProperty(this, 'get', {
			get () {
				return function () {
					return value;
				}
			}
		});
		Reflect.defineProperty(this, 'set', {
			get () {
				return function (_value: string) {
					value = _value;
				}
			},
			enumerable: true
		});
	}
}

const myField = new MyFieldConstructor('zzz');
class MadeFieldClass extends BaseClass { myField = myField };
class SecondMadeFieldClass extends BaseClass { myField = myField };
const madeFieldInstance = new MadeFieldClass;
const secondMadeFieldInstance = new MadeFieldClass;
const thirdMadeFieldInstance = new SecondMadeFieldClass;

describe('props tests', () => {

	test('base instance has props', () => {
		expect(Object.keys(baseInstance)).toEqual(["numberValue", "stringValue", "booleanValue", "objectValue"]);
	});

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

		}).toThrow(new TypeError('Value Access Denied'));
	});

	test('fails boolean arithmetics', () => {
		expect(() => {

			baseInstance.booleanValue + 5;

		}).toThrow(new ReferenceError('Value Access Denied'));
	});

	test('correct boolean assignment', () => {

		let { booleanValue } = baseInstance;
		expect(booleanValue.valueOf()).toEqual(true);

		// warning!
		// booleanValue does not rely on baseInstance anymore!
		booleanValue = new Boolean(false);

		let value = baseInstance.booleanValue.valueOf();
		expect(value).toEqual(true);


		baseInstance.booleanValue = new Boolean(false);
		value = baseInstance.booleanValue.valueOf();
		expect(value).toEqual(false);

	});

	test('correct JSON.stringify', () => {
		const stringifyResult = JSON.stringify(baseInstance);
		expect(stringifyResult).toMatchSnapshot();
	});

	test('correct boolean constructor', () => {
		expect(baseInstance.booleanValue).toBeInstanceOf(Boolean);
	});

	test('correct object assignment', () => {
		baseInstance.objectValue = { a: 123 };
		expect(baseInstance.objectValue.a).toEqual(123);
	});

	test('correct custom field creation', () => {
		expect(madeFieldInstance.myField).toEqual('zzz');
	});
	test('correct custom field assignment', () => {
		madeFieldInstance.myField = 123;
		expect(secondMadeFieldInstance.myField).toEqual(123);
		expect(thirdMadeFieldInstance.myField).toEqual(123);
	});

	test('correct custom missing prop search creation', () => {
		// @ts-ignore
		expect(madeFieldInstance[Symbol.toStringTag]).toEqual(undefined);
		// @ts-ignore
		expect(madeFieldInstance[Symbol.iterator]).toEqual(undefined);
		const util = require('util');
		// @ts-ignore
		expect(madeFieldInstance[util.inspect.custom]).toEqual(undefined);
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

		baseInstance.numberValue = MUTATION_VALUE;

		const result = baseInstance.numberValue.valueOf() + 5;
		expect(result).toStrictEqual(3);

	});

	test('correct number arithmetics using hinting for Symbol.toPrimitive (hint)', () => {

		const result = 3 + +baseInstance.numberValue;
		expect(result).toStrictEqual(1);

	});

	test('correct number value', () => {
		expect(baseInstance.numberValue.toString()).toStrictEqual(MUTATION_VALUE.toString());
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

		}).toThrow(new TypeError('Attempt to Access to Undefined Prop: [ missingValue ] of Base'));
	});

});

describe('prototype mutations tests', () => {

	test('incorrect prototype invocation number get', () => {
		expect(() => {

			upperInstance.numberValue > 1;

		}).toThrow(new ReferenceError('Value Access Denied'));
	});

	test('incorrect prototype invocation number set', () => {
		expect(() => {

			upperInstance.numberValue = new Number(1);

		}).toThrow(new ReferenceError('Value Access Denied'));
	});


	test('incorrect prototype invocation string get', () => {
		expect(() => {

			upperInstance.stringValue > '1';

		}).toThrow(new ReferenceError('Value Access Denied'));
	});

	test('incorrect prototype invocation string set', () => {
		expect(() => {

			upperInstance.stringValue = new String(1);

		}).toThrow(new ReferenceError('Value Access Denied'));
	});

});

describe('methods tests', () => {

	test('functions are restricted for data type', () => {

		expect(() => {

			baseInstance.someMethod = function () { };

		}).toThrow(new TypeError('Functions are Restricted'));

	});

	test('proxy proto methods are SOLID', () => {

		const result = baseInstance.someMethod();
		expect(result).toBe(MUTATION_VALUE);

	});

});

describe('property re-definition works', () => {

	test('exact prototype invocation for correct property extraction', () => {

		Object.defineProperty(upperInstance, 'stringProp', {
			get() {
				const target = Reflect.getPrototypeOf(upperInstance) as {
					stringValue: string
				};
				return target.stringValue;
			}
		});

		const value = upperInstance.stringProp;
		expect(`${value}`).toEqual('123');

	});
});


describe('functional constructors tests', () => {
	test('construction made properly', () => {

		const { stringProp,
			constructor: {
				name
			}
		} = myFunctionalInstance;
		expect(name).toEqual('MyFunctionalConstructor');
		expect(stringProp.valueOf()).toEqual('123');

	});
});

describe('instanceof works', () => {
	test('for class construction', () => {

		expect(baseInstance).toBeInstanceOf(Base);

	});
	test('for simple construction', () => {

		expect(simpleInstance).toBeInstanceOf(SimpleBase);

	});
	test('for functional construction', () => {

		expect(myFunctionalInstance).toBeInstanceOf(MyFunctionalConstructor);

	});
});

describe('deep extend works', () => {
	test('class extended three times construction', () => {

		expect(tiripleExtendInstance).toBeInstanceOf(Base);
		expect(tiripleExtendInstance).toBeInstanceOf(SecondaryExtend);
		expect(tiripleExtendInstance).toBeInstanceOf(TripleExtend);
		expect(`${tiripleExtendInstance.stringValue}`).toEqual('123');
		expect(tiripleExtendInstance.second).toBeInstanceOf(Number);

	});

	test('network extention works', () => {
		expect(networkedInstance).toBeInstanceOf(NetworkedExtention);

		expect(() => {

			`${networkedInstance.stringValue}`;

		}).toThrow(new ReferenceError('Value Access Denied'));

	});

	test('builtin types works', () => {
		expect(extendedArrayInstance).toBeInstanceOf(Array);
		expect(extendedArrayInstance).toBeInstanceOf(ExtendedArray);
		expect(extendedArrayInstance[0]).toBe(1);
		extendedArrayInstance.unshift(0);
		extendedArrayInstance.push(5);
		expect(+extendedArrayInstance.length).toBe(5);
		expect(+extendedArrayInstance[0]).toBe(0);
		expect(+extendedArrayInstance[4]).toBe(5);

		expect(extendedSetInstance).toBeInstanceOf(Set);
		expect(extendedSetInstance).toBeInstanceOf(ExtendedSet);

		// JS Object.create(new Set([1, 2, 3])) is doing the same error!
		expect(() => {

			extendedSetInstance.has(0);

		}).toThrow(new TypeError('Method Set.prototype.has called on incompatible receiver [object Object]'));

	});
});