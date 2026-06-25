'use strict';

const fs = require('fs');
const BasePrototype = require('..');
const { FieldConstructor } = BasePrototype;

class StdoutField extends FieldConstructor {
	constructor() {
		super(null);
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		Reflect.defineProperty(this, 'set', {
			get() {
				return function (value) {
					process.stdout.write(String(value));
				};
			},
			enumerable: true
		});
	}
}

class StdinField extends FieldConstructor {
	constructor() {
		super(null);
		Reflect.defineProperty(this, 'enumerable', {
			value: true
		});
		Reflect.defineProperty(this, 'get', {
			get() {
				return function () {
					const buffer = Buffer.alloc(1024);
					const bytesRead = fs.readSync(process.stdin.fd, buffer, 0, 1024);
					return buffer.toString('utf8', 0, bytesRead).trim();
				};
			},
			enumerable: true
		});
	}
}

const Base = BasePrototype({
	in: new StdinField(),
	out: new StdoutField()
});

class ConsoleIO extends Base {
	constructor() {
		super();
		this.in = this.in;
		this.out = this.out;
	}
}

const io = new ConsoleIO();

// Read one line from stdin.
const input = io.in;
console.error('read from stdin:', JSON.stringify(input));

// Write to stdout via assignment.
io.out = `echo: ${input}\n`;
