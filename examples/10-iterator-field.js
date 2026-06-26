'use strict';

const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

// A queue-like FieldConstructor.
// Setter enqueues a value; getter returns the next value (FIFO).
// When the queue is empty, getter returns a sentinel symbol.
const EMPTY = Symbol('queue-empty');

class IteratorField extends FieldConstructor {
	constructor() {
		super(EMPTY);
		this._queue = [];
		Reflect.defineProperty(this, 'enumerable', { value: true });

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					return self._queue.length > 0 ? self._queue.shift() : EMPTY;
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (value) {
					self._queue.push(value);
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	stream: new IteratorField()
});

class Queue extends Base {
	constructor() {
		super();
		this.stream = this.stream;
	}
}

const queue = new Queue();

// Enqueue values through assignment.
queue.stream = 'a';
queue.stream = 'b';
queue.stream = 'c';

// Dequeue values through reads.
console.log('read 1:', queue.stream);
console.log('read 2:', queue.stream);
console.log('read 3:', queue.stream);
console.log('read 4 (empty):', queue.stream === EMPTY ? 'EMPTY' : queue.stream);
