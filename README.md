# TypeØmatica

[![Coverage Status](https://coveralls.io/repos/github/wentout/typeomatica/badge.svg?branch=main)](https://coveralls.io/github/wentout/typeomatica?branch=main)

![NPM](https://img.shields.io/npm/l/typeomatica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/typeomatica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/typeomatica)

[**$ npm install <u>typeomatica</u>**](https://www.npmjs.com/package/typeomatica)

This package is a part of [mnemonica](https://www.npmjs.com/package/mnemonica) project.

**Strict Runtime Type Checker for JavaScript Objects**

TypeØmatica uses JavaScript Proxies to enforce type safety at runtime, exactly as TypeScript expects at compile time. Once a property is assigned a value, its type is locked and cannot be changed.

---

## Quick Start

```typescript
import { BaseClass } from 'typeomatica';

class User extends BaseClass {
  name: string = 'default';
  age: number = 0;
}

const user = new User();

// ✓ Valid assignments
user.name = 'John';
user.age = 25;

// ✗ Runtime error (even if TypeScript is bypassed with @ts-ignore)
user.age = '25';  // TypeError: Type Mismatch
```

---

## Table of Contents

- [What is TypeØmatica?](#what-is-typeomatica)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
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
- `get` - Property reads
- `set` - Property writes (with type validation)
- `setPrototypeOf` - Blocks prototype changes
- `defineProperty` - Blocks property redefinition
- `deleteProperty` - Blocks property deletion

### Type Categories

| Category | Types | Behavior |
|----------|-------|----------|
| `primitives` | string, number, boolean, bigint, symbol, undefined | Type-locked accessors |
| `nullish` | null | Only null allowed |
| `objects` | object, arrays, dates | Same constructor type required |
| `functions` | methods | Restricted on data types |

---

## API Reference

### BaseClass

The primary class for strict-type objects.

```typescript
import { BaseClass } from 'typeomatica';

class MyClass extends BaseClass {
  field: string = 'value';
  constructor() {
    super();
  }
}
```

### BasePrototype

Functional equivalent of `BaseClass`.

```typescript
import { BasePrototype } from 'typeomatica';

const Base = BasePrototype({ initialProp: 123 });
class MyClass extends Base { }
```

### @Strict() Decorator

Apply strict typing without extending BaseClass.

```typescript
import { Strict } from 'typeomatica';

@Strict({ deep: true })
class MyClass {
  field: number = 0;
}
```

**Decorator Arguments:**
- First argument: Base prototype or options object
- Second argument: Options object

### Options Interface

```typescript
interface TypeomaticaOptions {
  strictAccessCheck?: boolean;  // default: false
}
```

**Options:**
- `strictAccessCheck: true` - Enables strict receiver checking (throws `ACCESS_DENIED` error when property is accessed from wrong context)
- `deep: true` - Enable recursive property checking (when using BasePrototype with initial values)

### Usage with Options

```typescript
// With BaseClass - strict access checking enabled
class SecureData extends BaseClass {
  secret: string = '';
  constructor() {
    super(undefined, { strictAccessCheck: true });
  }
}

// With BasePrototype - strict access checking enabled
const SecureBase = BasePrototype({ data: '' }, { strictAccessCheck: true });
class User extends SecureBase {
  name: string = '';
}

// With @Strict decorator - strict access checking enabled
@Strict(undefined, { strictAccessCheck: true })
class Product {
  price: number = 0;
}
```

### Symbol Exports

```typescript
import { 
  SymbolTypeomaticaProxyReference,  // Access proxy internals
  SymbolInitialValue                 // Access original values
} from 'typeomatica';
```

---

## Usage Patterns

### Pattern 1: Extending BaseClass

```typescript
import { BaseClass } from 'typeomatica';

class User extends BaseClass {
  name: string = '';
  age: number = 0;
  active: boolean = true;
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

@Strict({ deep: true })
class Product {
  id: number = 0;
  title: string = '';
  price: number = 0;
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
  name: string = 'default';
  age: number = 0;
}

// Inject type checking into prototype chain
Object.setPrototypeOf(UserData.prototype, new BaseClass({ deep: true }));

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
  str: string = 'hello';
  num: number = 42;
  bool: boolean = true;
  bigint: bigint = BigInt(100);
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
  nullValue: null = null;
  undefinedValue: undefined = undefined;
}

const n = new Nullable();
n.nullValue = null;              // ✓ Works
// @ts-ignore
n.nullValue = undefined;         // ✗ TypeError: Type Mismatch
```

### Objects

```typescript
class WithObject extends BaseClass {
  data: object = {};
  list: number[] = [];
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
  count: number = 10;
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
  message: string = 'hello';
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
| `Attempt to Access to Undefined Prop` | Error | Reading non-existent property |
| `Functions are Restricted` | TypeError | Function assigned to data property |
| `Re-Assirnment is Forbidden` | TypeError | Modifying read-only custom field |
| `Setting prototype is not allowed` | Error | Calling `Object.setPrototypeOf()` |
| `Defining new Properties is not allowed` | Error | Calling `Object.defineProperty()` |
| `Properties Deletion is not allowed` | Error | Calling `delete` on property |

---

## Integration with Mnemonica

TypeØmatica integrates seamlessly with [mnemonica](https://www.npmjs.com/package/mnemonica) for combined prototype inheritance and runtime type safety.

```typescript
import { decorate } from 'mnemonica';
import { BaseClass, Strict } from 'typeomatica';

@decorate()
@Strict()
class Entity extends BaseClass {
  id: string = '';
  createdAt: Date = new Date();
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
