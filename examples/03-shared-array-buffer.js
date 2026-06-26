'use strict';

const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

class AtomicInt32Field extends FieldConstructor {
	constructor(sharedBuffer, byteOffset = 0) {
		super(null);
		this.sharedArray = new Int32Array(sharedBuffer);
		this.byteOffset = byteOffset;
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});

		const self = this;
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					return {
						valueOf: () => Atomics.load(self.sharedArray, self.byteOffset),
						[Symbol.toPrimitive]: (hint) => {
							const value = Atomics.load(self.sharedArray, self.byteOffset);
							return hint === 'number' ? value : String(value);
						}
					};
				};
			},
			enumerable: true
		});

		Reflect.defineProperty(this, 'set', {
			get() {
				return function (value) {
					Atomics.store(self.sharedArray, self.byteOffset, value);
					Atomics.notify(self.sharedArray, self.byteOffset, 1);
				};
			},
			enumerable: true
		});
	}
}

if (isMainThread) {
	const sharedBuffer = new SharedArrayBuffer(4);
	const counter = new AtomicInt32Field(sharedBuffer, 0);

	const Base = BasePrototype({ counter });

	class SharedState extends Base {
		constructor() {
			super();
			this.counter = this.counter;
		}
	}

	const state = new SharedState();

	const worker = new Worker(__filename, {
		workerData: sharedBuffer
	});

	worker.on('message', (message) => {
		console.log('worker:', message);
	});

	worker.on('exit', () => {
		console.log('final counter:', state.counter.valueOf());
	});

	// Increment the counter and notify the worker.
	for (let i = 1; i <= 3; i++) {
		setTimeout(() => {
			state.counter = i;
			console.log('main: set counter to', i);
		}, i * 100);
	}
} else {
	const sharedBuffer = workerData;
	const counter = new AtomicInt32Field(sharedBuffer, 0);

	const Base = BasePrototype({ counter });

	class SharedState extends Base {
		constructor() {
			super();
			this.counter = this.counter;
		}
	}

	const state = new SharedState();

	for (let i = 0; i < 3; i++) {
		// Wait until the main thread changes the counter from its current value.
		const current = state.counter.valueOf();
		Atomics.wait(new Int32Array(sharedBuffer), 0, current);
		parentPort.postMessage(`observed counter = ${state.counter.valueOf()}`);
	}

	parentPort.postMessage('done');
}
