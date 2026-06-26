'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A simple mutable field with an external value store.
// All instances that receive the *same* FieldConstructor instance share
// that external store.
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

// A single FieldConstructor instance is shared across the prototype chain.
// It lives on the BasePrototype target, so every derived instance inherits
// the same external store.
const sharedField = new MutableField('initial');

const Base = BasePrototype({ shared: sharedField });

class BaseEntity extends Base {
	constructor() {
		super();
		this.shared = this.shared;
	}
}

class DerivedEntity extends BaseEntity {
	constructor() {
		super();
	}
}

const baseInstance = new BaseEntity();
const derivedInstance = new DerivedEntity();

console.log('base.shared:', baseInstance.shared);
console.log('derived.shared:', derivedInstance.shared);

// Assign through the base-level instance.
baseInstance.shared = 'set from base';

// The derived instance sees the same value because both accessors point to
// the same external FieldConstructor store.
console.log('after base assignment:');
console.log('base.shared:', baseInstance.shared);
console.log('derived.shared:', derivedInstance.shared);

// Assign through the derived-level instance.
derivedInstance.shared = 'set from derived';

console.log('after derived assignment:');
console.log('base.shared:', baseInstance.shared);
console.log('derived.shared:', derivedInstance.shared);
