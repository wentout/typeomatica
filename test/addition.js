'use strict';

const BasePrototype = require('..');

// eslint-disable-next-line new-cap
class Base extends BasePrototype({
	additionalProp: 321,
}) {
	numberValue = 123;
	constructor() {
		super();
		this.stringValue = '123';
		this.booleanValue = true;
		this.objectValue = {};
	}
}

const baseInstance = new Base;

describe('props tests', () => {

	test('base instance has props', () => {
		expect(Object.keys(baseInstance)).toEqual(['numberValue', 'stringValue', 'booleanValue', 'objectValue']);
	});

	test('JavaScript class fields allow re-definition', () => {
		baseInstance.numberValue = '123';
		expect(baseInstance.numberValue).toEqual('123');
	});

	test('everything the rest is the same', () => {
		expect(baseInstance.additionalProp).toEqual(321);
		expect(() => {
			baseInstance.stringValue = 123;
		}).toThrow(new TypeError('Type Mismatch'));
		expect(() => {
			baseInstance.booleanValue = 123;
		}).toThrow(new TypeError('Type Mismatch'));
		expect(() => {
			baseInstance.objectValue = null;
		}).toThrow(new TypeError('Type Mismatch'));
	});

});
