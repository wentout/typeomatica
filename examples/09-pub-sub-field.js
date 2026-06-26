'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A FieldConstructor that notifies subscribers every time the value changes.
class PubSubField extends FieldConstructor {
	constructor(value) {
		super(value);
		this._value = value;
		this._subscribers = [];
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					return self._value;
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (newValue) {
					self._value = newValue;
					self._subscribers.forEach((callback) => {
						callback(newValue);
					});
				};
			},
			enumerable: true
		});
	}

	subscribe(callback) {
		this._subscribers.push(callback);
		return () => {
			const index = this._subscribers.indexOf(callback);
			if (index !== -1) {
				this._subscribers.splice(index, 1);
			}
		};
	}
}

const temperatureField = new PubSubField(20);

const Base = BasePrototype({
	temperature: temperatureField
});

class Sensor extends Base {
	constructor() {
		super();
		this.temperature = this.temperature;
	}
}

const sensor = new Sensor();

const logs = [];
const unsubscribeA = temperatureField.subscribe((value) => {
	logs.push(`subscriber A: ${value}`);
});
const unsubscribeB = temperatureField.subscribe((value) => {
	logs.push(`subscriber B: ${value}`);
});

sensor.temperature = 21;
sensor.temperature = 22;

unsubscribeA();
sensor.temperature = 23;

console.log('notifications:', logs.join('; '));
