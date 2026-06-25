'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A simple mutable field with an external value store.
class MutableField extends FieldConstructor {
	constructor(value) {
		super(value);
		this._value = value;
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
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
				return function (value) {
					self._value = value;
				};
			},
			enumerable: true
		});
	}
}

// The *same* external store is injected into two completely unrelated
// class hierarchies.
const sharedState = new MutableField('initial');

const BaseA = BasePrototype({ state: sharedState });
const BaseB = BasePrototype({ state: sharedState });

class ServiceA extends BaseA {
	constructor() {
		super();
		this.state = this.state;
	}
}

class ServiceB extends BaseB {
	constructor() {
		super();
		this.state = this.state;
	}
}

const serviceA = new ServiceA();
const serviceB = new ServiceB();

console.log('serviceA.state:', serviceA.state);
console.log('serviceB.state:', serviceB.state);

// Change the value through ServiceA.
serviceA.state = 'changed by A';

console.log('after serviceA assignment:');
console.log('serviceA.state:', serviceA.state);
console.log('serviceB.state:', serviceB.state);

// Change the value through ServiceB.
serviceB.state = 'changed by B';

console.log('after serviceB assignment:');
console.log('serviceA.state:', serviceA.state);
console.log('serviceB.state:', serviceB.state);
