# TypeØmatica FieldConstructor Examples

This directory contains runnable examples of custom fields built with `FieldConstructor`.

## Running examples

Each example is a standalone Node.js file. Run them from the project root:

```bash
# Basic examples
node examples/01-function-constructor-getter.js
node examples/02-buffer-toJSON.js
node examples/04-uint-fields.js

# Shared state examples
node examples/06-shared-field-prototype-chain.js
node examples/07-shared-field-different-objects.js

# SharedArrayBuffer + worker_threads
node examples/03-shared-array-buffer.js

# Stdin/stdout fields (pipe input)
echo "hello" | node examples/05-stdin-stdout.js
```

Or run them all at once:

```bash
npm run examples
```

## Pattern used in these examples

Because `FieldConstructor` instances are used as property descriptors, they must be processed by TypeØmatica's proxy `set` trap. In these plain JavaScript examples we place the field instance on the `BasePrototype` target and then re-assign it inside the constructor:

```js
const Base = BasePrototype({
  field: new MyField('initial')
});

class Example extends Base {
  constructor() {
    super();
    this.field = this.field; // promotes the inherited field to a type-locked accessor
  }
}
```

In TypeScript with the project's Jest/ts-jest transform, class fields are processed differently and the explicit promotion step is usually not needed.

## Shared external store

Examples **06** and **07** demonstrate a powerful `FieldConstructor` pattern: a field whose value lives in an external store inside the `FieldConstructor` instance. When the same `FieldConstructor` instance is reused across prototype-chain levels or across unrelated objects, all of those accessors share the same value.

## Prerequisites

Make sure the library is built first:

```bash
npm run build
```

All examples import the local build:

```js
const BasePrototype = require('..');
```
