# Type ø matica

[![Coverage Status](https://coveralls.io/repos/github/wentout/typeomatica/badge.svg?branch=main)](https://coveralls.io/github/wentout/typeomatica?branch=main)

![NPM](https://img.shields.io/npm/l/typeomatica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/typeomatica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/typeomatica)

[**$ npm install <u>typeomatica</u>**](https://www.npmjs.com/package/typeomatica)


This package is a part of [mnemonica](https://www.npmjs.com/package/mnemonica) project.

Strict Types checker for objects which represent Data Types.

# how it works

see `test/index.ts`

```js

class SimpleBase extends BasePrototype {
	stringProp = '123';
};

// nect code line will work properly
simpleInstance.stringProp = '321';

// but next code line will throw TypeError('Type Mismatch')
// @ts-ignore
simpleInstance.stringProp = 123;

```

That is it. It will be impossible to assign anything else except of:

```js 
typeof something === 'string'
```

to `stringProp` in runtime.

As we describe Data Types &mdash; please take a peek for tests directory:
[HERE](https://github.com/wentout/typeomatica/blob/main/test/index.ts).
