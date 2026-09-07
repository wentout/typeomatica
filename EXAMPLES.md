# TypeØmatica Examples

All examples are standalone Node.js scripts in [`examples/`](./examples/). Run the full set with:

```bash
npm run examples
```

Or run a single example:

```bash
node examples/01-function-constructor-getter.js
```

## Existing examples

| # | File | Concept |
|---|------|---------|
| 01 | [`function-constructor-getter.js`](./examples/01-function-constructor-getter.js) | Subclass `FieldConstructor` using a function constructor instead of a `class`. |
| 02 | [`buffer-toJSON.js`](./examples/02-buffer-toJSON.js) | Wrap a `Buffer` so it serializes cleanly with `JSON.stringify`. |
| 03 | [`shared-array-buffer.js`](./examples/03-shared-array-buffer.js) | Share a single `FieldConstructor` instance across multiple objects. |
| 04 | [`uint-fields.js`](./examples/04-uint-fields.js) | Typed unsigned-integer fields (`UInt8`, `UInt16`, `UInt32`) with clamping. |
| 05 | [`stdin-stdout.js`](./examples/05-stdin-stdout.js) | Strictly typed stdin/stdout-style field handles. |
| 06 | [`shared-field-prototype-chain.js`](./examples/06-shared-field-prototype-chain.js) | Shared field behavior across a prototype chain. |
| 07 | [`shared-field-different-objects.js`](./examples/07-shared-field-different-objects.js) | Shared field state synchronized across different object instances. |

## Advanced examples

| # | File | Concept | Tier |
|---|------|---------|------|
| 08 | [`async-field.js`](./examples/08-async-field.js) | Async getter / deferred async setter with `Promise` descriptors. | Practical |
| 09 | [`pub-sub-field.js`](./examples/09-pub-sub-field.js) | Pub/sub field: subscribers are notified on every set. | Practical |
| 10 | [`iterator-field.js`](./examples/10-iterator-field.js) | Queue-like field: setter enqueues, getter dequeues. | Reactive |
| 11 | [`time-to-live-field.js`](./examples/11-time-to-live-field.js) | Field value auto-invalidates to `null` after N seconds. | Reactive |
| 12 | [`loop-field.js`](./examples/12-loop-field.js) | Fixed-point loop: setter provides the step function, getter advances one cycle. | CS exploration |
| 13 | [`recursive-field.js`](./examples/13-recursive-field.js) | Y-combinator-style recursion through field references. | CS exploration |
| 14 | [`async-loop-field.js`](./examples/14-async-loop-field.js) | Async variant of the loop field. | CS exploration |
| 15 | [`async-recursive-field.js`](./examples/15-async-recursive-field.js) | Async variant of the recursive field. | CS exploration |
| 16 | [`defineproperty-trap-field-initializers.js`](./examples/16-defineproperty-trap-field-initializers.js) | Evidence probe: which Proxy traps class field initializers can ever reach (prototype-chain vs super()-returns-proxy), incl. descriptors and private members. | Evidence probe |

## Design notes

### Async getters and setters

JavaScript property descriptors can return Promises, but the engine does **not** automatically await them. An async getter returns a `Promise`, and an async setter returns a `Promise` that the caller must handle if they need to wait for completion. Examples make this explicit.

### Class-field gotcha

Most examples use `declare prop: Type;` plus constructor assignment:

```typescript
class Example extends BaseClass {
  declare value: number;
  constructor() {
    super();
    this.value = 0;   // goes through the Proxy
  }
}
```

Initialized class fields (`value = 0`) bypass the Proxy and are not type-checked.

**Why we keep it that way (2026-09-03 decision):** example 16 probes the
alternative — a base constructor returning `new Proxy(this, handler)`
rebinds every derived class's `this`, and derived field initializers then
hit the `defineProperty` trap (multi-level chains included). We decided
**not** to adopt that machinery: it adds real complexity, it can never
observe private members (a spec-level blind spot — and private members on
a proxy-returning base become landmines that throw on later access), and
we want class fields to stay unrestricted during construction. The
exposed API may still vary **after** construction; construction itself
stays plain.

The decisive reason is freedom of choice, not history: **the bypass IS
the opt-out.** If initializers were intercepted, strictness would be
mandatory for every field with no escape hatch. As it stands, the user
picks per field — an initializer stays unrestricted, a constructor-body
`this.x = …` is type-checked. And there is a second hatch with the same
shape: an explicit `Object.defineProperty(this, …)` — inside the
constructor or later on the finished instance — defines directly on the
receiver, walks no prototype chain, and therefore bypasses checking too.
A `defineProperty` trap would close BOTH hatches at once: no freedom
left, strictness everywhere. Removing the blind spot would remove the
user's ability to choose.

Historical note (the original, pre-probe reason): down-level transpile
targets (ES3-era TypeScript) rewrite class fields into constructor-body
assignments anyway, so field-initializer interception is not even a
stable concept across build pipelines. Strictness was therefore always
meant for explicit `[[Set]]` while the constructor runs — the one form
that reliably reaches a prototype-chain proxy — not for initializers.
Simple but working beats complete but fragile.

### Tier 3: CS exploration

The loop and recursive examples are conceptual demonstrations of fixed-point combinators and lazy evaluation using TypeØmatica descriptors. They are labeled as exploration rather than production patterns.
