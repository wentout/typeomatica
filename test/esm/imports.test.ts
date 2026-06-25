import { describe, it, expect } from 'vitest';

import BasePrototype, {
	BaseClass,
	BaseConstructorPrototype,
	FieldConstructor,
	Strict,
	SymbolInitialValue,
	SymbolTypeomaticaProxyReference,
	baseTarget,
	TypeomaticaOptions
} from 'typeomatica';

describe('ESM imports', () => {

	it('default export is BaseConstructorPrototype', () => {
		expect(typeof BasePrototype).toBe('function');
		expect(BasePrototype).toBe(BaseConstructorPrototype);
	});

	it('named exports are functions and symbols', () => {
		expect(typeof BaseClass).toBe('function');
		expect(typeof FieldConstructor).toBe('function');
		expect(typeof Strict).toBe('function');
		expect(typeof baseTarget).toBe('function');
		expect(typeof SymbolInitialValue).toBe('symbol');
		expect(typeof SymbolTypeomaticaProxyReference).toBe('symbol');
	});

	it('FieldConstructor works through ESM import', () => {
		const field = new FieldConstructor('initial');
		expect(field.get()).toBe('initial');
		expect(() => {
			// @ts-ignore
			field.set('new');
		}).toThrow('Re-Assirnment is Forbidden');
	});

	it('BaseClass works through ESM import', () => {
		class User extends BaseClass {
			declare name: string;
			constructor() {
				super();
				this.name = 'default';
			}
		}
		const user = new User();
		expect(user.name.valueOf()).toBe('default');
		user.name = 'John';
		expect(user.name.valueOf()).toBe('John');
		expect(() => {
			// @ts-ignore
			user.name = 123;
		}).toThrow('Type Mismatch');
	});

	it('Strict decorator works through ESM import', () => {
		const Decorated = Strict()(class {
			declare value: number;
			constructor() {
				this.value = 123;
			}
		});
		const instance = new Decorated();
		expect(instance.value.valueOf()).toBe(123);
		instance.value = 456;
		expect(instance.value.valueOf()).toBe(456);
		expect(() => {
			// @ts-ignore
			instance.value = 'wrong';
		}).toThrow('Type Mismatch');
	});

	it('TypeomaticaOptions type is importable', () => {
		const options: TypeomaticaOptions = { strictAccessCheck: true };
		expect(options.strictAccessCheck).toBe(true);
	});

});
