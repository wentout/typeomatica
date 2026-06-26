'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A FieldConstructor that wraps a recursive function using the
// Y-combinator pattern. The setter accepts a function `f` that takes
// a recursive callback and returns the actual function to expose.
//
// Example: factorial = n => n <= 1 ? 1 : n * factorial(n - 1)
class RecursiveField extends FieldConstructor {
	constructor(recursiveDefinition) {
		super(recursiveDefinition);
		this._definition = recursiveDefinition;
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					const Y = (f) => ((x) => f((y) => x(x)(y)))((x) => f((y) => x(x)(y)));
					return Y(self._definition);
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (value) {
					if (typeof value !== 'function') {
						throw new TypeError('Type Mismatch');
					}
					self._definition = value;
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	factorial: new RecursiveField((factorial) => (n) => {
		if (n <= 1) {
			return 1;
		}
		return n * factorial(n - 1);
	})
});

class Calculator extends Base {
	constructor() {
		super();
		this.factorial = this.factorial;
	}
}

const calc = new Calculator();

console.log('5! =', calc.factorial(5));
console.log('7! =', calc.factorial(7));
