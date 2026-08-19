import { describe, it, expect } from 'vitest';

import {
	BaseClass,
	finalize,
	finalizeBy,
	getConstructedFields,
	isFinalized,
	unwrap
} from 'typeomatica';

// The point of this suite: real class-field syntax. It only tests what it
// claims if the fields are installed with define semantics
// (useDefineForClassFields: true, native since ES2022) — see the local
// tsconfig.json in this directory. The Jest suite compiles class fields to
// constructor assignments instead and simulates the same with
// Object.defineProperty.

class NativeFields extends BaseClass {
	hidden = 42;
	declare shown: number;
	constructor () {
		super();
		this.shown = 1;
	}
}

describe('native class fields (define semantics)', () => {

	it('class field initializers bypass the proxy and stay untracked', () => {
		const i = new NativeFields();
		expect(getConstructedFields(i).has('shown')).toBe(true);
		expect(getConstructedFields(i).has('hidden')).toBe(false);
		expect(i.hidden).toBe(42); // plain own data property
	});

	it('finalize re-guards a native class field and preserves the value', () => {
		const i = new NativeFields();
		finalize(i);
		expect(isFinalized(i)).toBe(true);
		expect(i.hidden.valueOf()).toBe(42);
		expect(() => {
			// @ts-ignore
			i.hidden = 'nope';
		}).toThrow('Type Mismatch');
	});

	it('finalizeBy partially re-guards; unwrap rolls it back', () => {
		const i = new NativeFields();
		finalizeBy(i, ['hidden']);
		expect(isFinalized(i)).toBe(false);
		expect(() => {
			// @ts-ignore
			i.hidden = 'nope';
		}).toThrow('Type Mismatch');
		unwrap(i, 'hidden');
		expect(i.hidden).toBe(42);
		// @ts-ignore
		i.hidden = 'free again';
		expect(i.hidden).toBe('free again');
	});

});
