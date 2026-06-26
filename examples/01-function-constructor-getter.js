'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// Function-constructor subclass of FieldConstructor.
// Because FieldConstructor is a native class, we use Reflect.construct
// to call the superclass constructor from a function.
function TimestampField(value) {
	const self = Reflect.construct(FieldConstructor, [value], TimestampField);
	Reflect.defineProperty(self, 'enumerable', {
		value: true
	});
	Reflect.defineProperty(self, 'get', {
		get() {
			return function () {
				return self[FieldConstructor.SymbolInitialValue];
			};
		},
		enumerable: true
	});
	return self;
}

TimestampField.prototype = Object.create(FieldConstructor.prototype);
Reflect.defineProperty(TimestampField.prototype, 'constructor', {
	value: TimestampField,
	writable: true,
	configurable: true
});

// Place the custom field instance on the BasePrototype target.
// In the constructor we re-assign it (`this.created = this.created`) to
// promote the inherited property to a type-locked accessor on the instance.
const Base = BasePrototype({
	created: new TimestampField(new Date('2024-01-01T00:00:00Z'))
});

class Event extends Base {
	constructor() {
		super();
		this.created = this.created;
	}
}

const event = new Event();

console.log('event.created:', event.created);

// The default setter throws on reassignment.
try {
	event.created = new Date();
} catch (error) {
	console.log('reassignment rejected:', error.message);
}
