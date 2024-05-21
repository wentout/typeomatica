'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert').strict;

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
		const realKeys = Object.keys(baseInstance);
		const needKeys = ['numberValue', 'stringValue', 'booleanValue', 'objectValue'];
		assert.deepEqual(realKeys, needKeys);
	});

	test('JavaScript class fields allow re-definition', () => {
		baseInstance.numberValue = '123';
		assert.equal(baseInstance.numberValue, '123');
	});

	test('everything the rest is the same', () => {
		assert.equal(baseInstance.additionalProp, 321);
		assert.throws(() => {
			baseInstance.stringValue = 123;
		}, new TypeError('Type Mismatch'));
		assert.throws(() => {
			baseInstance.booleanValue = 123;
		}, new TypeError('Type Mismatch'));
		assert.throws(() => {
			baseInstance.objectValue = null;
		}, new TypeError('Type Mismatch'));
	});

});
