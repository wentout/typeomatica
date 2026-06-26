'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A FieldConstructor with an async getter and a deferred setter.
//
// Important: JavaScript assignment expressions return the right-hand side,
// not the setter's return value, so you cannot `await store.data = value`.
// Instead, the setter synchronously records a pending Promise; the getter
// awaits that Promise before returning the value.
class AsyncField extends FieldConstructor {
	constructor(value) {
		super(value);
		this._value = value;
		this._pending = Promise.resolve();
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return async function () {
					await self._pending;
					return self._value;
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (newValue) {
					if (typeof newValue !== typeof self._value) {
						throw new TypeError('Type Mismatch');
					}
					self._pending = new Promise((resolve) => {
						setTimeout(() => {
							self._value = newValue;
							resolve();
						}, 50);
					});
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	data: new AsyncField('initial')
});

class Store extends Base {
	constructor() {
		super();
		this.data = this.data;
	}
}

(async () => {
	const store = new Store();

	// Reading the field returns a Promise that resolves to the stored value.
	console.log('initial async value:', await store.data);

	// Assignment starts an async update; the getter waits for it.
	store.data = 'updated';
	console.log('after async set:', await store.data);

	// Type mismatch is rejected synchronously by the setter.
	try {
		store.data = 123;
	} catch (error) {
		console.log('type mismatch rejected:', error.message);
	}

	console.log('final value:', await store.data);
})();
