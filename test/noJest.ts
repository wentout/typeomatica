
// BasePrototype & BaseClass are the same function
// go as you want for being meaningfull
// or meaningless
const BasePrototype = require('..');
import { BaseClass, Strict } from '..';

interface IBase {
	get getterField(): string
	// eslint-disable-next-line no-unused-vars
	set setterField(value: string)
	numberValue: number
	stringValue: string
	booleanValue: boolean
	objectValue: object
}



// eslint-disable-next-line new-cap
@Strict({ someProp: 123 })
class DecoratedByBase {
	someProp!: number;
}

class ExtendedDecoratedByBase extends DecoratedByBase {
	someProp: number;
	constructor() {
		super();
		this.someProp = 321;
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
		debugger;
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
debugger;
const baseInstance = new Base;
console.log(baseInstance);
debugger;

const upperInstance = Object.create(baseInstance);
console.log(upperInstance);

class SimpleBase extends BaseClass {
	stringProp = '123';
	// ES2022
	// stringProp: string;
	// constructor() {
	// 	super();
	// 	this.stringProp = '123';
	// }
}

debugger;
const simpleInstance = new SimpleBase;
console.log(simpleInstance);

debugger;
const decorated = new DecoratedByBase;
console.log(decorated);

debugger;
const exdecorated = new ExtendedDecoratedByBase;
console.log(exdecorated);

debugger;
