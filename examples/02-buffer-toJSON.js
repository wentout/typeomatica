'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

class BufferField extends FieldConstructor {
	constructor(value) {
		super(value);
		this.buffer = value;
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					// Return an object that inherits from the Buffer
					// but overrides toJSON and valueOf.
					return Object.create(self.buffer, {
						toJSON: {
							value: () => self.buffer.toJSON()
						},
						valueOf: {
							value: () => self.buffer
						}
					});
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	payload: new BufferField(Buffer.from('hello'))
});

class Message extends Base {
	constructor() {
		super();
		this.payload = this.payload;
	}
}

const message = new Message();

console.log('JSON:', JSON.stringify(message.payload));
console.log('valueOf length:', message.payload.valueOf().length);

// Reassignment is forbidden because BufferField does not override set.
try {
	message.payload = Buffer.from('world');
} catch (error) {
	console.log('reassignment rejected:', error.message);
}
