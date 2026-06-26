'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// Async variant of the loop field.
// The step function returns a Promise; the getter awaits it before
// returning the next value.
class AsyncLoopField extends FieldConstructor {
	constructor(start, step) {
		super(start);
		this._value = start;
		this._step = step;
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return async function () {
					const current = self._value;
					self._value = await self._step(self._value);
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
	counter: new AsyncLoopField(1, async (n) => {
		return new Promise((resolve) => {
			setTimeout(() => resolve(n + 1), 20);
		});
	})
});

class AsyncCounter extends Base {
	constructor() {
		super();
		this.counter = this.counter;
	}
}

(async () => {
	const counter = new AsyncCounter();

	console.log('async step 0:', await counter.counter);
	console.log('async step 1:', await counter.counter);
	console.log('async step 2:', await counter.counter);
})();
