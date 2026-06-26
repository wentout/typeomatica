# TypeØmatica — Agent Guide

## What this project is

Runtime strict-type enforcement for JavaScript objects using Proxies and decorators. The core idea: once a property is assigned a value, its type is locked; later assignments of a different type throw.

## File map

| File | Purpose |
|------|---------|
| `src/index.ts` | Core: `BaseClass`, `BaseConstructorPrototype` (default export), `@Strict` decorator, proxy handlers, CJS export setup. |
| `src/esm.ts` | ESM entry point. Re-exports default + named bindings from `src/index.ts`. |
| `src/fields.ts` | `FieldConstructor` class for custom property descriptors. |
| `src/errors.ts` | Error message constants. |
| `src/types/*.ts` | Type-category handlers: `primitives`, `objects`, `functions`, `special`, `nullish`. |
| `src/types/index.ts` | Aggregates and exports `isPrimitive`. |
| `test/index.ts` | Jest CJS test suite. Must keep 100% coverage. |
| `test/esm/imports.test.ts` | Vitest tests for true ESM imports. |
| `test/noJest.ts` | Node native test file (currently requires a TS loader to run). |
| `examples/` | Runnable integration examples. |
| `lib/` | CJS build output. |
| `lib/esm/` | ESM build output. |

## Build & test commands

```bash
npm run build        # rm -rf lib/ && tsc (CJS) && tsc -p tsconfig.esm.json (ESM)
npm run test:cov     # Jest CJS tests with coverage; must be 100%
npm run test:esm     # Vitest true-ESM import tests
npm run examples     # run every example in examples/
npm run lint:src     # ESLint on src/
npm run lint:lib     # ESLint on lib/
```

## Module architecture

- CJS consumers get `lib/index.js` via `main` / `exports.require`.
- ESM consumers get `lib/esm/esm.js` via `exports.import`.
- `src/esm.ts` is excluded from the CJS build (`tsconfig.json` `exclude`) and built only by `tsconfig.esm.json` using `module: esnext` + `moduleResolution: bundler` so TypeScript emits ESM syntax without requiring `"type": "module"` in `package.json`.
- `lib/esm/package.json` is generated during build with `{"type":"module"}`.
- `src/index.ts` contains a `setupCommonJS()` block guarded by `typeof module !== 'undefined'`; it redefines `module.exports` to `BaseConstructorPrototype` and attaches named getters for `BaseClass`, `FieldConstructor`, etc.

## Coverage rules

- **Jest must stay at 100%** for statements, branches, functions, and lines.
- Jest instruments the built `lib/index.js` and maps coverage back to `src/`.
- Istanbul ignore hints (`/* istanbul ignore next */`) must survive into `lib/`, so `tsconfig.json` sets `removeComments: false`.
- Any code path only reachable through true ESM imports should be covered by a Vitest test in `test/esm/`.

## Conventions

- Use **tabs** for indentation.
- Relative imports in `src/` must include the `.js` extension (`'./errors.js'`, `'./types/index.js'`). This is required for the ESM build.
- Class properties that should be type-checked must be declared with `declare prop: Type;` and assigned inside the constructor. Initialized class fields (`prop: Type = value`) bypass the Proxy.
- `src/esm.ts` must not introduce new runtime logic; it only re-exports.

## What to discuss before changing

- Proxy handler logic in `createHandlers()`.
- `module.exports` redefinition or named export setup.
- Decorator signatures in `strict()`.
- `SymbolTypeomaticaProxyReference` semantics.
- Changes to `FieldConstructor` that affect how it is detected in `createProperty()`.

## How to add a new example

1. Create `examples/NN-descriptive-name.js`.
2. Make it runnable with `node examples/NN-descriptive-name.js`.
3. Add it to the `examples` script in `package.json`.
4. Add an entry to `EXAMPLES.md`.

## How to add a new source file

1. Place it under `src/` or `src/types/`.
2. Use `.js` extensions in all relative imports.
3. If it is ESM-only, exclude it from `tsconfig.json` and include it in `tsconfig.esm.json`.
4. Add tests in `test/index.ts` (Jest) or `test/esm/` (Vitest) as appropriate.
5. Run `npm run build && npm run test:cov && npm run test:esm && npm run examples`.
