# TypeØmatica

[![Coverage Status](https://coveralls.io/repos/github/wentout/typeomatica/badge.svg?branch=main)](https://coveralls.io/github/wentout/typeomatica?branch=main)

![NPM](https://img.shields.io/npm/l/typeomatica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/typeomatica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/typeomatica)

[**$ npm install <u>typeomatica</u>**](https://www.npmjs.com/package/typeomatica)

**Strict Runtime Type Checker for JavaScript Objects**

TypeØmatica uses JavaScript Proxies to enforce type safety at runtime, exactly as TypeScript expects at compile time. Once a property is assigned a value, its type is locked and cannot be changed.

---

## Quick Start

```typescript
import { BaseClass } from 'typeomatica';

class User extends BaseClass {
  declare name: string;
  declare age: number;
  constructor() {
    super();
    this.name = 'default';
    this.age = 0;
  }
}

const user = new User();

// ✓ Valid assignments
user.name = 'John';
user.age = 25;

// ✗ Runtime error (even if TypeScript is bypassed with @ts-ignore)
user.age = '25';  // TypeError: Type Mismatch
```

> **Important:** initialized class fields (`name = 'default'`) are stored as own properties and bypass the proxy. Use `declare name: string;` plus constructor assignment, or see `FieldConstructor` for custom descriptors.

---

## Module Support

TypeØmatica ships both CommonJS and ESM builds:

- **CommonJS:** `require('typeomatica')` resolves to `lib/index.js`.
- **ESM:** `import { BaseClass, FieldConstructor } from 'typeomatica'` resolves to `lib/esm/esm.js`.
- The dual build is produced by `tsconfig.json` (CJS) and `tsconfig.esm.json` (ESM).
- `package.json` `exports` maps `".".require` to `lib/index.js` and `".".import` to `lib/esm/esm.js`.

---

## Development Commands

```bash
npm run build        # clean build of lib/ and lib/esm/
npm run test:cov     # Jest CJS tests + 100% coverage
npm run test:esm     # Vitest true-ESM import tests
npm run examples     # run all examples/
npm run lint:src     # ESLint on src/
```

---

## Architecture

- `src/index.ts` — shared core: `BaseClass`, `BaseConstructorPrototype` (default export), `@Strict` decorator, proxy handlers, and CJS `module.exports` setup.
- `src/esm.ts` — ESM entry point that re-exports the default and named bindings from `src/index.ts`.
- `src/fields.ts` — `FieldConstructor` class for custom property descriptors.
- `src/types/*.ts` — type-category handlers (primitives, objects, functions, special, nullish).
- `test/index.ts` — Jest CJS test suite (50 tests, 100% coverage).
- `test/esm/` — Vitest tests that exercise the actual ESM `exports` map.
- `examples/` — runnable integration examples.

---

## Coverage Policy

- Jest CJS tests must keep **100%** coverage across statements, branches, functions, and lines.
- Code paths that can only be reached through true ESM imports are covered by Vitest in `test/esm/`.
- Istanbul ignore hints are preserved because `tsconfig.json` sets `removeComments: false`.

---

## Table of Contents

- [What is TypeØmatica?](#what-is-typeomatica)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Module Support](#module-support)
- [Development](#development)
- [API Reference](#api-reference)
- [Usage Patterns](#usage-patterns)
- [Type Examples](#type-examples)
- [Working with Wrapped Values](#working-with-wrapped-values)
- [Error Reference](#error-reference)
- [Integration with Mnemonica](#integration-with-mnemonica)

---

## What is TypeØmatica?

TypeØmatica provides strict runtime type checking for JavaScript objects using Proxy-based interception. It ensures that once a property is initialized with a type, that type cannot be violated at runtime.

**Key Features:**
- Runtime type enforcement (complements TypeScript's compile-time checks)
- Proxy-based property interception
- Type locking after initial assignment
- Prevents prototype mutation, property redefinition, and deletion

---

## Installation

```bash
npm install typeomatica
```

---

## Core Concepts

### How It Works

TypeØmatica wraps objects with JavaScript Proxies that intercept:
- `get` - Property reads (undefined properties return `undefined`)
- `set` - Property writes (with type validation)
- `setPrototypeOf` - Blocks prototype changes
- `defineProperty` - Blocks property redefinition
- `deleteProperty` - Blocks property deletion

### Type Categories

| Category | Types | Behavior |
|----------|-------|----------|
| `primitives` | string, number, boolean | Type-locked accessors |
| `special` | bigint, symbol, undefined | Same `typeof` required |
| `nullish` | null | Any assignment throws after initialization |
| `objects` | object, arrays, dates | Same constructor type required |
| `functions` | methods | Restricted on data types |

---

## Development

- **For AI agents / contributors:** see [`AGENTS.md`](./AGENTS.md) for the file map, build pipeline, coverage rules, and conventions.
- **For human readers:** see [`FOR_HUMANS.md`](./FOR_HUMANS.md) for the motivation, mental model, and friendly examples.
- **Runnable patterns:** see [`EXAMPLES.md`](./EXAMPLES.md) for a catalog of all examples.

---

## API Reference

### BaseClass

The primary class for strict-type objects.

```typescript
import { BaseClass } from 'typeomatica';

class MyClass extends BaseClass {
  declare field: string;
  constructor() {
    super();
    this.field = 'value';
  }
}
```

### BaseConstructorPrototype (default export)

Functional equivalent of `BaseClass`. The default export of the package is `BaseConstructorPrototype`, which can be called without `new` to produce a base constructor.

```typescript
import BasePrototype from 'typeomatica';
// or: import { BaseConstructorPrototype } from 'typeomatica';

const Base = BasePrototype({ initialProp: 123 });
class MyClass extends Base { }
```

### @Strict() Decorator

Apply strict typing without extending BaseClass.

```typescript
import { Strict } from 'typeomatica';

@Strict()
class MyClass {
  declare field: number;
  constructor() {
    this.field = 0;
  }
}
```

**Decorator Arguments:**
- First argument: optional target object used as the prototype base
- Second argument: optional options object

### FieldConstructor

Build custom property descriptors with controlled getters and setters. When a `FieldConstructor` instance is assigned to a BaseClass/BasePrototype property, its `get` and `set` methods are used directly as the property descriptor.

```typescript
import { BaseClass, FieldConstructor, SymbolInitialValue } from 'typeomatica';

// Default FieldConstructor: read-only field
const createdAt = new FieldConstructor(new Date());

class Record extends BaseClass {
  createdAt = createdAt as unknown | Date;
}

const record = new Record();
console.log(record.createdAt);           // ✓ Works
// @ts-ignore
record.createdAt = new Date();           // ✗ TypeError: Re-Assirnment is Forbidden
```

**Custom read/write field:**

```typescript
class MutableField extends FieldConstructor {
  _value: string;
  constructor(value: string) {
    super(value);
    this._value = value;
    Reflect.defineProperty(this, 'enumerable', { value: true });
    const self = this;
    Reflect.defineProperty(this, 'get', {
      get() {
        return function () { return self._value; };
      },
      enumerable: true
    });
    Reflect.defineProperty(this, 'set', {
      get() {
        return function (value: string) { self._value = value; };
      },
      enumerable: true
    });
  }
}

const displayName = new MutableField('Guest');

class User extends BaseClass {
  displayName = displayName as unknown | string;
}

const user = new User();
console.log(user.displayName);  // 'Guest'
user.displayName = 'Alice';     // ✓ Works
console.log(user.displayName);  // 'Alice'
```

**Function-constructor getter:**

If you prefer function constructors over classes, subclass `FieldConstructor` through the prototype chain:

```typescript
function TimestampField(this: any, value: Date) {
  return Reflect.construct(FieldConstructor, [value], TimestampField);
}
TimestampField.prototype = Object.create(FieldConstructor.prototype);
Reflect.defineProperty(TimestampField.prototype, 'constructor', {
  value: TimestampField,
  writable: true,
  configurable: true
});

Reflect.defineProperty(TimestampField.prototype, 'get', {
  get() {
    const self = this as FieldConstructor;
    return function () {
      return self[SymbolInitialValue];
    };
  },
  enumerable: true
});

const created = new (TimestampField as any)(new Date());

class Event extends BaseClass {
  created = created as unknown | Date;
}

const event = new Event();
console.log(event.created);  // Date instance
```

**Buffer field with `toJSON` support:**

Wrap a `Buffer` so it serializes cleanly with `JSON.stringify`:

```typescript
class BufferField extends FieldConstructor {
  buffer: Buffer;
  constructor(value: Buffer) {
    super(value);
    this.buffer = value;
    Reflect.defineProperty(this, 'enumerable', { value: true });
    const self = this;
    Reflect.defineProperty(this, 'get', {
      get() {
        return function () {
          return Object.create(self.buffer, {
            toJSON: {
              value: () => self.buffer.toJSON()
            },
            valueOf: {
              value: () => self.buffer
            }
          });
        };
      },
      enumerable: true
    });
  }
}

const payload = new BufferField(Buffer.from('hello'));

class Message extends BaseClass {
  payload = payload as unknown | Buffer;
}

const message = new Message();
console.log(JSON.stringify(message.payload)); // {"type":"Buffer","data":[104,101,108,108,111]}
```

**Typed unsigned integer fields:**

Create `UInt8`, `UInt16`, and `UInt32` fields that clamp values, validate types, and expose `Symbol.toPrimitive` for arithmetic:

```typescript
function createUIntField(bits: 8 | 16 | 32) {
  const max = 2 ** bits - 1;

  return class UIntField extends FieldConstructor {
    numericValue: number;
    constructor(value: number) {
      super(value);
      const initial = parseInt(String(value), 10);
      if (isNaN(initial)) {
        throw new TypeError('Type Mismatch');
      }
      this.numericValue = Math.max(0, Math.min(max, initial));
      Reflect.defineProperty(this, 'enumerable', { value: true });

      const self = this;
      Reflect.defineProperty(this, 'get', {
        get() {
          return function () {
            return {
              valueOf: () => self.numericValue,
              [Symbol.toPrimitive]: (hint: string) => {
                return hint === 'number' ? self.numericValue : String(self.numericValue);
              }
            };
          };
        },
        enumerable: true
      });

      Reflect.defineProperty(this, 'set', {
        get() {
          return function (newValue: number) {
            const num = parseInt(String(newValue), 10);
            if (isNaN(num)) {
              throw new TypeError('Type Mismatch');
            }
            self.numericValue = Math.max(0, Math.min(max, num));
          };
        },
        enumerable: true
      });
    }
  };
}

const UInt8Field = createUIntField(8);
const UInt16Field = createUIntField(16);
const UInt32Field = createUIntField(32);

class Registers extends BaseClass {
  flags = new UInt8Field(0) as unknown | number;
  count = new UInt16Field(1000) as unknown | number;
  timestamp = new UInt32Field(Date.now()) as unknown | number;
}

const registers = new Registers();
registers.flags = 255;          // ✓ Works
// @ts-ignore
registers.flags = 256;          // ✗ clamps to 255 (or throw if you prefer)
// @ts-ignore
registers.flags = 'not a number'; // ✗ TypeError: Type Mismatch

const doubled = registers.count.valueOf() * 2;
```

**Notes:**
- Set `enumerable: true` on the instance if the property should appear in `Object.keys()`.
- Reusing the same `FieldConstructor` instance across multiple class instances will share state.
- Access the original constructor value through `FieldConstructor.SymbolInitialValue` or `instance[SymbolInitialValue]`.

### Options Interface

```typescript
interface TypeomaticaOptions {
  strictAccessCheck?: boolean;  // default: false
}
```

**Options:**
- `strictAccessCheck: true` - Enables strict receiver checking (throws `ACCESS_DENIED` error when property is accessed from wrong context)

### Usage with Options

```typescript
// With BaseClass - strict access checking enabled
class SecureData extends BaseClass {
  declare secret: string;
  constructor() {
    super(undefined, { strictAccessCheck: true });
    this.secret = '';
  }
}

// With BasePrototype - strict access checking enabled
const SecureBase = BasePrototype({ data: '' }, { strictAccessCheck: true });
class User extends SecureBase {
  declare name: string;
  constructor() {
    super();
    this.name = '';
  }
}

// With @Strict decorator - strict access checking enabled
@Strict({ starterProp: true }, { strictAccessCheck: true })
class Product {
  declare price: number;
  constructor() {
    this.price = 0;
  }
}
```

### Symbol Exports

```typescript
import BasePrototype, { 
  BaseConstructorPrototype,         // Functional equivalent of BaseClass
  BaseClass,                        // Primary strict-type base class
  Strict,                           // Decorator for strict typing
  SymbolTypeomaticaProxyReference,  // Access proxy internals
  SymbolInitialValue,               // Access original values
  baseTarget                        // Utility to create a null-prototype object
} from 'typeomatica';

// FieldConstructor is also available as a named export
import { FieldConstructor } from 'typeomatica';
```

---

## Usage Patterns

### Pattern 1: Extending BaseClass

```typescript
import { BaseClass } from 'typeomatica';

class User extends BaseClass {
  declare name: string;
  declare age: number;
  declare active: boolean;
  constructor() {
    super();
    this.name = '';
    this.age = 0;
    this.active = true;
  }
}

const user = new User();
user.name = 'John';     // ✓ Works
user.age = 25;          // ✓ Works

// @ts-ignore
user.age = '25';        // ✗ TypeError: Type Mismatch
```

### Pattern 2: @Strict Decorator

```typescript
import { Strict } from 'typeomatica';

@Strict()
class Product {
  declare id: number;
  declare title: string;
  declare price: number;
  constructor() {
    this.id = 0;
    this.title = '';
    this.price = 0;
  }
}

const product = new Product();
product.price = 29.99;      // ✓ Works
// @ts-ignore
product.price = '$29.99';   // ✗ TypeError: Type Mismatch
```

### Pattern 3: BaseClass as Prototype

```typescript
import { BaseClass } from 'typeomatica';

class UserData {
  declare name: string;
  declare age: number;
  constructor() {
    this.name = 'default';
    this.age = 0;
  }
}

// Inject type checking into prototype chain
Object.setPrototypeOf(UserData.prototype, new BaseClass());

const user = new UserData();
user.name = 'John';     // ✓ Works
// @ts-ignore
user.name = 123;        // ✗ TypeError: Type Mismatch
```

---

## Type Examples

### Primitives

```typescript
import { BaseClass } from 'typeomatica';

class Primitives extends BaseClass {
  declare str: string;
  declare num: number;
  declare bool: boolean;
  declare bigint: bigint;
  constructor() {
    super();
    this.str = 'hello';
    this.num = 42;
    this.bool = true;
    this.bigint = BigInt(100);
  }
}

const p = new Primitives();
p.str = 'world';          // ✓ Works
p.num = 100;              // ✓ Works
// @ts-ignore
p.str = 123;              // ✗ TypeError: Type Mismatch
```

### Null and Undefined

```typescript
class Nullable extends BaseClass {
  declare nullValue: null;
  declare undefinedValue: undefined;
  constructor() {
    super();
    this.nullValue = null;
    this.undefinedValue = undefined;
  }
}

const n = new Nullable();
n.nullValue = null;              // ✓ First assignment creates the property
// @ts-ignore
n.nullValue = null;              // ✗ TypeError: Type Mismatch (null cannot be reassigned)
// @ts-ignore
n.nullValue = undefined;         // ✗ TypeError: Type Mismatch

n.undefinedValue = undefined;    // ✓ Works
// @ts-ignore
n.undefinedValue = 123;          // ✗ TypeError: Type Mismatch
```

### Objects

```typescript
class WithObject extends BaseClass {
  declare data: object;
  declare list: number[];
  constructor() {
    super();
    this.data = {};
    this.list = [];
  }
}

const w = new WithObject();
w.data = { a: 1 };              // ✓ Works
w.list = [1, 2, 3];             // ✓ Works
// @ts-ignore
w.data = 123;                   // ✗ TypeError: Type Mismatch
// @ts-ignore
w.data = new Set();             // ✗ TypeError: Type Mismatch (Set !== Object)
```

---

## Working with Wrapped Values

TypeØmatica wraps primitives to enforce type safety. Use `valueOf()` for operations.

### Numeric Operations

```typescript
class Calc extends BaseClass {
  declare count: number;
  constructor() {
    super();
    this.count = 10;
  }
}

const calc = new Calc();

// ✗ Direct arithmetic throws
const result = calc.count + 5;  // ReferenceError: Value Access Denied

// ✓ Use valueOf()
const result = calc.count.valueOf() + 5;  // 15
const sum = 3 + +calc.count;               // 13
```

### String Operations

```typescript
class Text extends BaseClass {
  declare message: string;
  constructor() {
    super();
    this.message = 'hello';
  }
}

const text = new Text();
text.message.valueOf().toUpperCase();  // 'HELLO'
text.message.valueOf().length;         // 5
```

---

## Error Reference

| Error Message | Error Type | When Thrown |
|---------------|------------|-------------|
| `Type Mismatch` | TypeError | Wrong type assigned to property |
| `Value Access Denied` | ReferenceError | Property accessed from wrong context (only when `strictAccessCheck: true`) |
| `Functions are Restricted` | TypeError | Function assigned to data property |
| `Re-Assirnment is Forbidden` | TypeError | Modifying read-only custom field |
| `Setting prototype is not allowed!` | Error | Calling `Object.setPrototypeOf()` |
| `Defining new Properties is not allowed!` | Error | Calling `Object.defineProperty()` |
| `Properties Deletion is not allowed!` | Error | Calling `delete` on property |

---

## Integration with Mnemonica

TypeØmatica integrates seamlessly with [mnemonica](https://www.npmjs.com/package/mnemonica) for combined prototype inheritance and runtime type safety.

```typescript
import { decorate } from 'mnemonica';
import { BaseClass, Strict } from 'typeomatica';

@decorate()
@Strict()
class Entity extends BaseClass {
  declare id: string;
  declare createdAt: Date;
  constructor() {
    super();
    this.id = '';
    this.createdAt = new Date();
  }
}

// Works with mnemonica's inheritance system
const User = Entity.define('User', function(this: { email: string }) {
  this.email = '';
});

const user = new User();
// @ts-ignore
user.email = 123;  // ✗ TypeError: Type Mismatch
```

**Decorator Order Matters:**
- `@Strict()` must come AFTER `@decorate()` (inner decorator)
- Decorators apply bottom-to-top

For complete integration documentation, see [mnemonica's TypeØmatica guide](https://github.com/wentout/mnemonica/blob/main/core/TypeØmatica.md).

---

## License

MIT

Copyright (c) 2019-2024 https://github.com/wentout
