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

## Planned examples

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

### Tier 3: CS exploration

The loop and recursive examples are conceptual demonstrations of fixed-point combinators and lazy evaluation using TypeØmatica descriptors. They are labeled as exploration rather than production patterns.
