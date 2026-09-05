/**
 * Evidence probe: does a Proxy `defineProperty` trap EVER see class field
 * initializers?
 *
 * Background claim under test: `field = 'x'` initializers use
 * [[DefineOwnProperty]] DIRECTLY ON the receiver (`this`) — no prototype
 * chain walk. So:
 *   - a proxy on the PROTOTYPE chain (typeomatica-style) sees nothing;
 *   - but IF `this` ITSELF is a proxy at initializer time, the trap must
 *     fire. The only standard way to get a proxy as `this` before derived
 *     field initializers run: a base constructor that RETURNS a proxy
 *     (super() return-value override rebinds `this`, and derived field
 *     initializers run right after that rebinding).
 *
 * Each trap hit is logged. Silence is the result too.
 *
 * DECISION (2026-09-03): the `super()`-returns-`Proxy(this)` machinery
 * proven here is NOT adopted by typeomatica. It works — derived field
 * initializers do reach a `defineProperty` trap once `this` is a proxy —
 * but: base-class own fields still run before the proxy exists (silently),
 * private fields/methods/accessors are spec-level invisible to traps, and
 * private state on the proxy-returning base becomes a brand-check landmine
 * (TypeError on later access through the proxy). Decisively: the
 * initializer bypass IS the user's opt-out from strictness — intercepting
 * it would make checking mandatory with no escape hatch. Explicit
 * Object.defineProperty(this, ...) — in the constructor or later on the
 * finished instance — is the second hatch (defines directly on the
 * receiver, no chain walk); a trap would close both at once. Class fields
 * stay unrestricted during construction; the exposed API may vary AFTER
 * construction.
 * This file is kept as the evidence base for that decision.
 */

function makeLogger (label) {
	const hits = [];
	const handler = {
		defineProperty (target, key, descriptor) {
			hits.push(`defineProperty(${String(key)})`);
			const result = Reflect.defineProperty(target, key, descriptor);
			return result;
		},
		set (target, key, value, receiver) {
			hits.push(`set(${String(key)})`);
			const result = Reflect.set(target, key, value, receiver);
			return result;
		},
	};
	return { handler, hits, label };
}

function report (label, hits) {
	const result = hits.length === 0 ? 'SILENT — no trap fired' : `TRAPS FIRED: ${hits.join(', ')}`;
	console.log(`${label}\n  → ${result}\n`);
}

// ---------------------------------------------------------------------
// Case 1 — Viktor's exact shape: field initializer + constructor with
// super(), proxy on the PROTOTYPE chain (typeomatica-style).
// Expectation: SILENT (initializers define on `this` directly).
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('proto');
	class Base1 {}
	const proxyProto = new Proxy({}, handler);
	Object.setPrototypeOf(Base1.prototype, proxyProto);

	class Derived1 extends Base1 {
		field = 'some';
		constructor () {
			super();
		}
	}
	Object.setPrototypeOf(Derived1.prototype, Base1.prototype); // chain: Derived1.prototype → Base1.prototype → proxyProto

	new Derived1();
	report('1. prototype-chain proxy + field initializer (typeomatica shape)', hits);
}

// ---------------------------------------------------------------------
// Case 2 — same prototype proxy, but assignment inside the constructor
// body: this.assigned = 'x'. Ordinary [[Set]] WALKS the chain.
// Expectation: set trap fires, defineProperty stays silent.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('proto');
	class Base2 {}
	const proxyProto = new Proxy({}, handler);
	Object.setPrototypeOf(Base2.prototype, proxyProto);

	class Derived2 extends Base2 {
		constructor () {
			super();
			this.assigned = 'body';
		}
	}
	Object.setPrototypeOf(Derived2.prototype, Base2.prototype);

	new Derived2();
	report('2. prototype-chain proxy + constructor-body assignment', hits);
}

// ---------------------------------------------------------------------
// Case 3 — THE CRUCIAL ONE: base constructor RETURNS a Proxy of `this`
// (super() return override). Derived field initializers then run with
// the PROXY as `this`. If the claim holds, defineProperty trap fires.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	class Base3 {
		constructor () {
			const result = new Proxy(this, handler);
			return result; // ← super() returns an object → derived `this` rebinds to the proxy
		}
	}

	class Derived3 extends Base3 {
		field = 'some'; // ← runs AFTER super(), ON the proxy, if the claim holds
		constructor () {
			super();
		}
	}

	new Derived3();
	report('3. super()-returns-proxy + DERIVED field initializer', hits);
}

// ---------------------------------------------------------------------
// Case 4 — same trick, but the field initializer is on the BASE class.
// Base initializers run BEFORE the base constructor body — the proxy
// does not exist yet.
// Expectation: SILENT even with the trick.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	class Base4 {
		baseField = 'early'; // ← runs before `new Proxy(...)` exists
		constructor () {
			const result = new Proxy(this, handler);
			return result;
		}
	}

	class Derived4 extends Base4 {
		constructor () {
			super();
		}
	}

	new Derived4();
	report('4. super()-returns-proxy + BASE class field initializer', hits);
}

// ---------------------------------------------------------------------
// Case 5 — control: explicit Reflect.defineProperty on a proxy instance.
// Proves the trap itself works and the silence above is semantic.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('control');
	const proxy = new Proxy({}, handler);
	Reflect.defineProperty(proxy, 'explicit', { value: 1, enumerable: true, configurable: true, writable: true });
	report('5. control — explicit Reflect.defineProperty on a proxy', hits);
}

// ---------------------------------------------------------------------
// Case 6 — bonus: same proxy-`this`, derived constructor body assignment.
// Expectation: set trap (assignment), not defineProperty.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	class Base6 {
		constructor () {
			const result = new Proxy(this, handler);
			return result;
		}
	}

	class Derived6 extends Base6 {
		field = 'init';
		constructor () {
			super();
			this.assigned = 'body';
		}
	}

	new Derived6();
	report('6. proxy-this + derived field AND body assignment (both traps?)', hits);
}

// ---------------------------------------------------------------------
// Case 7 — Viktor's chain: class Next extends Root extends Base, Base
// returns the proxy. Does the trap see field initializers THREE levels
// up? Mechanism: Base's super()-return rebinds `this` once; each derived
// constructor implicitly returns `this` (the proxy), and each level's
// field initializers run right after ITS super() — on the proxy.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	class Base7 {
		constructor () {
			const result = new Proxy(this, handler);
			return result;
		}
	}

	class Root7 extends Base7 {
		rootField = 'root-level';
		constructor () {
			super();
		}
	}

	class Next7 extends Root7 {
		nextField = 'next-level';
		constructor () {
			super();
			this.bodyAssigned = 'next-body';
		}
	}

	new Next7();
	report('7. Next extends Root extends Base(proxy-returning) — all levels', hits);
}

// ---------------------------------------------------------------------
// Case 8 — public get/set accessors + the field DESCRIPTOR question.
// Accessors are defined on the PROTOTYPE at class-evaluation time (the
// proxy does not exist yet and is not the prototype anyway) — so expect
// silence at definition; usage goes through [[Get]]/[[Set]] on the
// proxy-this. Also: log the descriptor the defineProperty trap receives
// for a field initializer (expect enumerable/writable/configurable all
// true — CreateDataProperty semantics, no syntax can say otherwise).
// ---------------------------------------------------------------------
{
	const hits = [];
	const handler = {
		defineProperty (target, key, descriptor) {
			hits.push(`defineProperty(${String(key)}) descriptor=${JSON.stringify(descriptor, (k, v) => typeof v === 'function' ? 'fn' : v)}`);
			const result = Reflect.defineProperty(target, key, descriptor);
			return result;
		},
		set (target, key, value, receiver) {
			hits.push(`set(${String(key)})`);
			const result = Reflect.set(target, key, value, receiver);
			return result;
		},
	};
	class Base8 {
		constructor () {
			const result = new Proxy(this, handler);
			return result;
		}
	}
	class Next8 extends Base8 {
		field = 'init';
		get computed () { return 42; }
		set computed (v) { this.viaAccessor = v; }
		constructor () {
			super();
			this.computed = 5;       // accessor write through the proxy
			const read = this.computed; // accessor read through the proxy
		}
	}
	new Next8();
	report('8. field descriptor + public get/set accessors on proxy-this', hits);
}

// ---------------------------------------------------------------------
// Case 9 — PRIVATE field on the derived class. Private elements install
// via PrivateFieldAdd on `this` — which requires the [[PrivateFieldValues]]
// internal slot. A Proxy has NO such slot...
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	class Base9 {
		constructor () {
			const result = new Proxy(this, handler);
			return result;
		}
	}
	try {
		class Next9 extends Base9 {
			#secret = 'hidden';
			reveal () { return this.#secret; }
			constructor () {
				super();
			}
		}
		const instance9 = new Next9();
		hits.push('constructed OK (no trap, no throw)');
		try {
			const revealed = instance9.reveal();
			hits.push(`read via proxy OK: ${revealed}`);
		} catch (e) {
			hits.push(`read via proxy THREW: ${e.constructor.name}: ${e.message}`);
		}
		report('9. PRIVATE field on proxy-this', hits);
	} catch (e) {
		hits.push(`THREW: ${e.constructor.name}: ${e.message}`);
		report('9. PRIVATE field on proxy-this', hits);
	}
}

// ---------------------------------------------------------------------
// Case 10 — private getter/setter pair on the derived class.
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	class Base10 {
		constructor () {
			const result = new Proxy(this, handler);
			return result;
		}
	}
	try {
		class Next10 extends Base10 {
			#v = 0;
			get #p () { return this.#v; }
			set #p (x) { this.#v = x; }
			useAccessors () {
				this.#p = 7;
				const result = this.#p;
				return result;
			}
			constructor () {
				super();
			}
		}
		const instance10 = new Next10();
		hits.push('constructed OK (no trap, no throw)');
		try {
			const used = instance10.useAccessors();
			hits.push(`private get/set via proxy OK: ${used}`);
		} catch (e) {
			hits.push(`private get/set via proxy THREW: ${e.constructor.name}: ${e.message}`);
		}
		report('10. private getter/setter on proxy-this', hits);
	} catch (e) {
		hits.push(`THREW: ${e.constructor.name}: ${e.message}`);
		report('10. private getter/setter on proxy-this', hits);
	}
}

// ---------------------------------------------------------------------
// Case 11 — the reverse hazard: private field on the BASE (installed on
// the raw object BEFORE the proxy exists — that part works), but then a
// method accessing this.#f is called THROUGH the proxy after
// construction. Brand check runs against the proxy...
// ---------------------------------------------------------------------
{
	const { handler, hits } = makeLogger('this-proxy');
	try {
		class Base11 {
			#baseSecret = 'base-hidden';
			constructor () {
				const result = new Proxy(this, handler);
				return result;
			}
			revealBase () { return this.#baseSecret; }
		}
		class Next11 extends Base11 {
			constructor () {
				super();
			}
		}
		const instance = new Next11();
		try {
			const revealed = instance.revealBase();
			hits.push(`read through proxy OK: ${revealed}`);
		} catch (e) {
			hits.push(`read through proxy THREW: ${e.constructor.name}: ${e.message}`);
		}
		report('11. private field on BASE, accessed through the proxy later', hits);
	} catch (e) {
		hits.push(`construction THREW: ${e.constructor.name}: ${e.message}`);
		report('11. private field on BASE, accessed through the proxy later', hits);
	}
}
