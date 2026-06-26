'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// Async variant of the recursive field.
// The recursive definition returns a function that produces Promises.
class AsyncRecursiveField extends FieldConstructor {
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
	asyncFactorial: new AsyncRecursiveField((factorial) => async (n) => {
		if (n <= 1) {
			return 1;
		}
		const sub = await factorial(n - 1);
		return n * sub;
	})
});

class AsyncCalculator extends Base {
	constructor() {
		super();
		this.asyncFactorial = this.asyncFactorial;
	}
}

(async () => {
	const calc = new AsyncCalculator();

	console.log('5! async =', await calc.asyncFactorial(5));
	console.log('7! async =', await calc.asyncFactorial(7));
})();
