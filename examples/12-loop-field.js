'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A fixed-point loop field.
// The setter receives the step function; the getter applies it once
// per read and returns the new value. There is no exit condition:
// every read advances the loop by one step.
class LoopField extends FieldConstructor {
	constructor(start, step) {
		super(start);
		this._value = start;
		this._step = step;
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					const current = self._value;
					self._value = self._step(self._value);
					return current;
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (value) {
					if (typeof value === 'function') {
						self._step = value;
					} else {
						self._value = value;
					}
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	counter: new LoopField(0, (n) => n + 1)
});

class Counter extends Base {
	constructor() {
		super();
		this.counter = this.counter;
	}
}

const counter = new Counter();

console.log('step 0:', counter.counter);
console.log('step 1:', counter.counter);
console.log('step 2:', counter.counter);

// Change the loop body at runtime.
counter.counter = (n) => n * 2;
console.log('step 3 (doubling):', counter.counter);
console.log('step 4 (doubling):', counter.counter);
