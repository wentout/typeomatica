# TypeØmatica — For Humans

> Runtime type enforcement that feels like TypeScript, but happens while your code is running.

## What is this?

**TypeØmatica** is a small library that locks the type of every property on an object after its first assignment. If something later tries to put the wrong kind of value there, it throws — even if the bad assignment comes through `@ts-ignore`, `eval`, a malformed JSON payload, or a third-party module that doesn’t know about your types.

It is not a replacement for TypeScript. It is a **runtime safety net** for the places TypeScript cannot reach.

## Why would I want it?

TypeScript is excellent at compile-time checks, but JavaScript is still what actually runs. Here are a few places where runtime enforcement helps:

- **Dynamic data** — parsing JSON, reading from `localStorage`, receiving events from a WebSocket.
- **API boundaries** — data coming from another service may claim to be a number but arrive as a string.
- **`@ts-ignore` and casts** — code reviews miss them; TypeØmatica does not.
- **Teaching and exploration** — it makes the idea of "types" tangible at runtime.

And the nicest part: for many classes it is a **one-line change**.

```typescript
import { BaseClass } from 'typeomatica';

class User extends BaseClass {   // ← one line
  declare name: string;
  declare age: number;
  constructor() {
    super();
    this.name = '';
    this.age = 0;
  }
}
```

## The mental model

TypeØmatica puts a **Proxy** on the prototype chain of your class. Every property write goes through that Proxy first.

The Proxy asks a simple question: *"Has this property been seen before, and if so, is the new value the same type as the old one?"*

- First assignment → type is recorded.
- Same type later → allowed.
- Different type later → `TypeError: Type Mismatch`.

The Proxy also blocks prototype mutation, property redefinition, and deletion, because those are common ways to sneak around type checks.

## The one big gotcha: class fields

Modern TypeScript/JavaScript class fields are initialized as **own properties** on the instance. Own properties do not trigger the Proxy on the prototype chain, so TypeØmatica cannot enforce their types.

So instead of this:

```typescript
class User extends BaseClass {
  name: string = '';   // ❌ bypasses the proxy
}
```

do this:

```typescript
class User extends BaseClass {
  declare name: string; // type-only, no runtime field
  constructor() {
    super();
    this.name = '';     // ✅ goes through the proxy
  }
}
```

Or use `FieldConstructor` if you need custom getters/setters.

## Five-minute example

```typescript
import { BaseClass } from 'typeomatica';

class User extends BaseClass {
  declare name: string;
  declare age: number;
  constructor() {
    super();
    this.name = '';
    this.age = 0;
  }
}

const user = new User();

user.name = 'John';   // ✓ fine
user.age = 25;        // ✓ fine

// @ts-ignore
user.age = '25';      // ✗ throws TypeError: Type Mismatch
```

## When it shines most

Any TypeScript or typed JavaScript project where runtime validation is valuable. It is especially useful when:

- the data comes from outside your code,
- you are experimenting and want fast feedback,
- you want a cheap, drop-in guardrail (`extends BaseClass`).

It is less ideal for:

- **Hot paths** — Proxy interception adds overhead.
- **Browser bundles** — the library assumes a Node.js environment (`util`, `module`).
- **Purely static, fully trusted code** — TypeScript alone may be enough.

## Where to go next

- [`README.md`](./README.md) for the full API reference.
- [`EXAMPLES.md`](./EXAMPLES.md) for runnable patterns and advanced ideas.
- [`AGENTS.md`](./AGENTS.md) if you are an AI agent or contributor looking for the project map.
