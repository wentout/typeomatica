// oxlint-disable no-unused-expressions
// oxlint-disable typescript/no-this-alias
/* eslint-disable no-debugger */
'use strict';
import { describe, expect, test } from '@jest/globals';

// BasePrototype & BaseClass are the same function
// go as you want for being meaningfull
// or meaningless
const BasePrototype = require('..');
const { BaseClass, FieldConstructor, SymbolInitialValue, Strict, SymbolTypeomaticaProxyReference } = BasePrototype;

const givenTags = new Map();
let givenTagsInvocations = 0;
const addTag = <T>(instance: T): T => {
	++givenTagsInvocations;
	// @ts-ignore
	const tag = instance[SymbolTypeomaticaProxyReference] as string;
	if (typeof tag !== 'string') {
		debugger;
		throw new Error('Instance has no Typeomatica Tag');
	}
	let sequence;
	if (givenTags.has(tag)) {
		sequence = givenTags.get(tag);
		sequence.add(instance);
	} else {
		sequence = new Set([instance]);
		sequence.add(instance);
	}
	givenTags.set(tag, sequence);
	return instance;
};

debugger; // eslint-disable-line no-debugger

interface IBase {
	get getterField(): string
	// eslint-disable-next-line no-unused-vars
	set setterField(value: string)
	numberValue: number
	stringValue: string
	booleanValue: boolean
	objectValue: object
}

let decoratedSomeProp = 0;
// const s = BasePrototype({ someProp: 123 });
// console.log(s);

// eslint-disable-next-line new-cap
@Strict({ someProp: 123 })
class DecoratedByBase {
	someProp!: number;
}

// @Strict({ someProp: 123 })
class ExtendedDecoratedByBase extends DecoratedByBase {
	someProp: number;
	constructor() {
		super();
		this.someProp = 321;
		decoratedSomeProp = this.someProp;
	}
}

// eslint-disable-next-line new-cap
class Base extends BasePrototype({
	additionalProp: 321,
	someMethod() {
		return this.numberValue.valueOf();
	},
}) implements IBase {
	numberValue = 123;
	stringValue: string;
	booleanValue: boolean;
	objectValue: object;

	get getterField() {
		const answer = `${this.stringValue}`;
		return answer;
	}

	set setterField(value: string) {
		this.stringValue = value;
	}

	constructor() {
		super();
		this.stringValue = '123';
		this.booleanValue = true;
		this.objectValue = {};
		// ES2022
		// Object.defineProperty(this, 'getterField', {
		// 	get() {
		// 		const answer = `${this.stringValue}`;
		// 		return answer;
		// 	}
		// });
		// Object.defineProperty(this, 'setterField', {
		// 	set(value: string) {
		// 		this.stringValue = value;
		// 	}
		// });
	}
}
const baseInstance = addTag(new Base);

const upperInstance = Object.create(baseInstance);
class SimpleBase extends BaseClass {
	stringProp = '123';
	// ES2022
	propString: string;
	constructor() {
		super();
		this.propString = '123';
	}
}
const simpleInstance = addTag(new SimpleBase);

interface IFCstr<S> {
	(): void
	new(): {
		[key in keyof S]: S[key]
	}
}

type TmyFunctionalInstance = { stringProp: string }
// eslint-disable-next-line no-unused-vars
const MyFunctionalConstructor = function (this: TmyFunctionalInstance) {
	this.stringProp = '123';
} as IFCstr<TmyFunctionalInstance>;

const protoMFC = addTag(new BasePrototype);
Reflect.setPrototypeOf(MyFunctionalConstructor.prototype, protoMFC);

const myFunctionalInstance = addTag(new MyFunctionalConstructor());

class SecondaryExtend extends Base { second = 123; }
class TripleExtend extends SecondaryExtend { }
const tiripleExtendInstance = addTag(new TripleExtend);

// eslint-disable-next-line new-cap
class NetworkedExtention extends BasePrototype(tiripleExtendInstance) { }

const networkedInstance = addTag(new NetworkedExtention);

// eslint-disable-next-line new-cap
class ExtendedArray extends BasePrototype([1, 2, 3]) { }
// eslint-disable-next-line new-cap
class ExtendedSet extends BasePrototype(new Set([1, 2, 3])) { }

const extendedArrayInstance = addTag(new ExtendedArray);
const extendedSetInstance = addTag(new ExtendedSet);

const MUTATION_VALUE = -2;


class MyFieldConstructorNoRe extends FieldConstructor {
	_value: string;
	constructor(value: string) {
		super(value);
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		this._value = value;
	}
}
class MyFieldConstructorReGet extends MyFieldConstructorNoRe {
	constructor(value: string) {
		super(value);
		const self = this;
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					return self._value;
				};
			},
			enumerable: true
		});
	}
}
class MyFieldConstructorReSet extends MyFieldConstructorNoRe {
	constructor(value: string) {
		super(value);
		const self = this;
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		Reflect.defineProperty(this, 'set', {
			get() {
				return function (_value: string) {
					self._value = _value;
				};
			},
			enumerable: true
		});
	}
}
class MyFieldConstructor extends MyFieldConstructorReGet {
	constructor(value: string) {
		super(value);
		const self = this;
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		Reflect.defineProperty(this, 'set', {
			get() {
				return function (_value: string) {
					self._value = _value;
				};
			},
			enumerable: true
		});
	}
}

const myField = new MyFieldConstructor('initial value');
const myFieldReGet = new MyFieldConstructorReGet('initial value for get check');
const myFieldReSet = new MyFieldConstructorReSet('initial value for set check');

class MadeFieldClass extends BaseClass {
	myField = myField as unknown | string;
	get [SymbolInitialValue]() {
		const self = this;
		return (fieldName: 'myField') => {
			if (fieldName !== 'myField') {
				return self[fieldName];
			}
			//@ts-ignore
			const answer = myField[SymbolInitialValue];
			return answer;
		};
	}
}
class SecondMadeFieldClass extends BaseClass { myField = myField as unknown | string; }
const madeFieldInstance = addTag(new MadeFieldClass);
const secondMadeFieldInstance = addTag(new MadeFieldClass);
const thirdMadeFieldInstance = addTag(new SecondMadeFieldClass);

class MadeReGet extends BaseClass { myField = myFieldReGet as unknown | string; }
class MadeReSet extends BaseClass { myField = myFieldReSet as unknown | string; }
const madeReGet = addTag(new MadeReGet);
const madeReSet = addTag(new MadeReSet);

describe('props tests', () => {

	test('decorators works', () => {
		const rgp = Reflect.getPrototypeOf;
		const decorated = addTag(new DecoratedByBase);
		const exdecorated = addTag(new ExtendedDecoratedByBase);
		expect(decoratedSomeProp.valueOf()).toEqual(321);
		expect(exdecorated.someProp.valueOf()).toEqual(321);
		expect(decorated.someProp.valueOf()).toEqual(123);
		const proto = rgp(decorated);
		//@ts-expect-error;
		expect(proto.someProp).toEqual(123);
	});

	test('base instance has props', () => {
		let gf: string;
		let sv: string;
		expect(Object.keys(baseInstance)).toEqual(['numberValue', 'stringValue', 'booleanValue', 'objectValue']);

		gf = baseInstance.getterField;
		expect(gf).toEqual('123');
		sv = baseInstance.stringValue;
		expect(sv.valueOf()).toEqual('123');


		baseInstance.setterField = '12345';

		gf = baseInstance.getterField;
		expect(gf).toEqual('12345');
		sv = baseInstance.stringValue;
		expect(sv.valueOf()).toEqual('12345');

		baseInstance.setterField = '123';

		gf = baseInstance.getterField;
		expect(gf).toEqual('123');
		sv = baseInstance.stringValue;
		expect(`${sv}`).toEqual('123');
	});

	test('simple instance works & strings too', () => {
		expect(simpleInstance.stringProp.toString()).toBe('123');
		expect(simpleInstance.stringProp.length).toBe(3);
		expect(simpleInstance.propString.toString()).toBe('123');
		expect(simpleInstance.propString.length).toBe(3);


		expect(/String$/.test(simpleInstance.stringProp.constructor.name)).toBe(true);
		expect(() => {
			// @ts-expect-error
			simpleInstance.stringProp = 123;

		}).toThrow(new TypeError('Type Mismatch'));
	});

	test('correct boolean comparison with type coercion', () => {
		expect(baseInstance.booleanValue !== false).toEqual(true);

		const message = 'Value Access Denied';
		let error1: any;
		let error2: any;
		try {
			const { booleanValue } = baseInstance;
			booleanValue != false;
		} catch (error) {
			error1 = error;
		}
		expect(error1.message).toEqual(message);
		expect(error1).toBeInstanceOf(ReferenceError);
		try {
			const { booleanValue } = baseInstance;
			booleanValue > false;
		} catch (error) {
			error2 = error;
		}
		expect(error2).toBeInstanceOf(ReferenceError);
		expect(error2.message).toEqual(message);

	});

	test('fails boolean arithmetics', () => {
		expect(() => {

			// @ts-expect-error
			baseInstance.booleanValue + 5;

		}).toThrow(new ReferenceError('Value Access Denied'));
	});

	test('correct boolean assignment', () => {

		let { booleanValue } = baseInstance;
		expect(booleanValue.valueOf()).toEqual(true);

		// warning!
		// booleanValue does not rely on baseInstance anymore!
		// @ts-expect-error
		booleanValue = new Boolean(false);

		let value = baseInstance.booleanValue.valueOf();
		expect(value).toEqual(true);

		// @ts-expect-error
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
		// @ts-expect-error
		expect(baseInstance.objectValue.a).toEqual(123);
	});

	test('correct custom field creation', () => {
		expect(madeFieldInstance.myField).toEqual('initial value');
	});

	test('correct custom field assignment', () => {
		madeFieldInstance.myField = 'replaced';
		//@ts-ignore
		const initialValue = madeFieldInstance[SymbolInitialValue]('myField');
		expect(initialValue).toEqual('initial value');
		expect(secondMadeFieldInstance.myField).toEqual('replaced');
		expect(thirdMadeFieldInstance.myField).toEqual('replaced');

		madeFieldInstance.myField = 'replaced secondary';
		expect(secondMadeFieldInstance.myField).toEqual('replaced secondary');
		expect(thirdMadeFieldInstance.myField).toEqual('replaced secondary');

		madeFieldInstance.myField = 'replaced';
		expect(secondMadeFieldInstance.myField).toEqual('replaced');
		expect(thirdMadeFieldInstance.myField).toEqual('replaced');
	});

	test('correct custom field no-re-assignment', () => {
		expect(madeReGet.myField).toEqual('initial value for get check');
		expect(() => {

			madeReGet.myField = 'replaced';

		}).toThrow(new TypeError('Re-Assirnment is Forbidden'));
	});

	test('correct custom field setter only', () => {
		madeReSet.myField = 'replaced';
		expect(madeReSet.myField).toEqual('initial value for set check');
	});

	test('takes error on wrong field definition', () => {
		expect(() => {
			class WrongFieldConstructor extends FieldConstructor {
				value: number;
				constructor(value: number) {
					super(value);
					this.value = value;
				}
			}
			const wrongField = new WrongFieldConstructor(123);
			class WithWrongField extends BaseClass {
				erroredField = wrongField;
			}
			new WithWrongField;

		}).toThrow();
	});

	test('correct custom missing prop search creation', () => {
		//@ts-ignore
		expect(madeFieldInstance[Symbol.toStringTag]).toEqual('MadeFieldClass lacks definition of [ Symbol(Symbol.toStringTag) ]');
		//@ts-ignore
		expect(madeFieldInstance[Symbol.iterator]).toEqual('MadeFieldClass lacks definition of [ Symbol(Symbol.iterator) ]');
		const util = require('util');
		//@ts-ignore
		expect(madeFieldInstance[util.inspect.custom]).toEqual('MadeFieldClass lacks definition of [ Symbol(nodejs.util.inspect.custom) ]');
		let errorMessage = 'not received';
		try {
			String(madeFieldInstance);
		} catch (_err) {
			if (_err instanceof Error){
				errorMessage = _err.message;
			}
		}
		const expected = 'Attempt to Access to Undefined Prop: [ Symbol(Symbol.toPrimitive) ] for MadeFieldClass';
		expect(errorMessage).toEqual(expected);
	});

	test('wrong assignment to objects', () => {

		expect(() => {
			// @ts-expect-error
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
			// @ts-expect-error
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
		let error: any;
		try {
			baseInstance.missingValue > 1;
		} catch (_error) {
			error = _error;
		}
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toEqual('Attempt to Access to Undefined Prop: [ missingValue ] for Base');
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

describe('coverage: ', () => {
	test('builtin types works', () => {

		const FnEx1 = function () {};
		Object.defineProperty(FnEx1.prototype, SymbolTypeomaticaProxyReference, {
			value: true
		});
		

		@Strict()
		// @ts-ignore
		class CovCLS1 extends FnEx1 {
			field = 123;
		}



		debugger;
		const cov1 = new CovCLS1;
		expect(cov1.field).toBe(123);

		// debugger;

		// const FnEx2 = function () {};
		// Object.setPrototypeOf(FnEx2.prototype, Object.create(null));
		class CovCLS2 extends BasePrototype() {
			field = 123;
		}

		const cstr = CovCLS2.prototype.constructor;
		Object.defineProperty(CovCLS2.prototype, 'constructor', {
			get () {
				return cstr;
			}
		});

		Object.setPrototypeOf(CovCLS2.prototype, Object.create(null));
		let error: any;
		try {
			new CovCLS2;
		} catch (_error) {
			error = _error;
		}
		expect(error.message).toBe('Unable to setup TypeØmatica handler!');
	});

});

const skip = true;

describe(`check duplications, skipped ${skip}`,  () => {
	const stack: Array<string> = [];
	let count = 0;
	givenTags.forEach((sequence, key) => {
		const { size } = sequence;
		if (size > 1) {
			count = count + size;
			const message = `sequence.size is ${size} for ${key}`;
			stack.push(message);
		}
	});
	if (stack.length > 0) {
		const message = `tags in count of [ ${count} ] from [ ${givenTagsInvocations} ] used twice`;
		const error = new Error(message);
		stack.unshift(message);

		const stackStr = stack.join('\n');

		Object.defineProperty(error, 'stack', {
			get () {
				return stackStr;
			}
		});
		if (!skip) {
			test('givenTags.sequence has exatly one item', () => {
				throw error;
			});
		} else {
			test(stackStr, () => {
				console.debug(stackStr);
			});
		}
	}
});
