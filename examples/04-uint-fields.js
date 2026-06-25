'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

function createUIntField(bits) {
	const max = 2 ** bits - 1;

	return class UIntField extends FieldConstructor {
		constructor(value) {
			super(value);
			const initial = parseInt(String(value), 10);
			if (Number.isNaN(initial)) {
				throw new TypeError('Type Mismatch');
			}
			this.numericValue = Math.max(0, Math.min(max, initial));
			Reflect.defineProperty(this, 'enumerable', {
				value: true
			});

			const self = this;
			Reflect.defineProperty(this, 'get', {
				get() {
					return function () {
						return {
							valueOf: () => self.numericValue,
							[Symbol.toPrimitive]: (hint) => {
								return hint === 'number'
									? self.numericValue
									: String(self.numericValue);
							}
						};
					};
				},
				enumerable: true
			});

			Reflect.defineProperty(this, 'set', {
				get() {
					return function (newValue) {
						const num = parseInt(String(newValue), 10);
						if (Number.isNaN(num)) {
							throw new TypeError('Type Mismatch');
						}
						self.numericValue = Math.max(0, Math.min(max, num));
					};
				},
				enumerable: true
			});
		}
	};
}

const UInt8Field = createUIntField(8);
const UInt16Field = createUIntField(16);
const UInt32Field = createUIntField(32);

const Base = BasePrototype({
	flags: new UInt8Field(0),
	count: new UInt16Field(1000),
	timestamp: new UInt32Field(Date.now())
});

class Registers extends Base {
	constructor() {
		super();
		this.flags = this.flags;
		this.count = this.count;
		this.timestamp = this.timestamp;
	}
}

const registers = new Registers();

console.log('initial flags:', registers.flags.valueOf());

registers.flags = 255;
console.log('flags at max:', registers.flags.valueOf());

// Values are clamped to the unsigned range.
registers.flags = 256;
console.log('flags after overflow:', registers.flags.valueOf());

// Arithmetic works through Symbol.toPrimitive.
const doubled = registers.count * 2;
console.log('count * 2:', doubled);

// Invalid types are rejected.
try {
	registers.flags = 'not a number';
} catch (error) {
	console.log('invalid type rejected:', error.message);
}
