'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A FieldConstructor whose value "lives" for a fixed number of milliseconds.
// After that period, reads return null until the value is set again.
class TimeToLiveField extends FieldConstructor {
	constructor(value, ttlMs) {
		super(value);
		this._value = value;
		this._ttlMs = ttlMs;
		this._setAt = value === null ? 0 : Date.now();
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					const elapsed = Date.now() - self._setAt;
					return elapsed <= self._ttlMs ? self._value : null;
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (newValue) {
					self._value = newValue;
					self._setAt = Date.now();
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	session: new TimeToLiveField('active', 200)
});

class Session extends Base {
	constructor() {
		super();
		this.session = this.session;
	}
}

const session = new Session();

console.log('initial:', session.session);

// Wait until the TTL expires.
setTimeout(() => {
	console.log('after TTL:', session.session);

	// Refresh the value.
	session.session = 'refreshed';
	console.log('refreshed:', session.session);
}, 250);
