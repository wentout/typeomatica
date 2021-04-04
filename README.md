# typomatica

[![Coverage Status](https://coveralls.io/repos/github/wentout/typeomatica/badge.svg?branch=main)](https://coveralls.io/github/wentout/typeomatica?branch=main)

![NPM](https://img.shields.io/npm/l/typeomatica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/typeomatica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/typeomatica)

[![NPM](https://nodei.co/npm/typeomatica.png?mini=true)](https://www.npmjs.com/package/typeomatica)


this package is a part of [mnemonica](https://www.npmjs.com/package/mnemonica) project

simple strong type restriction for mnemonica based types

# how it works

see `test/index.ts`

```js

class SimpleBase extends BasePrototype {
	stringProp = '123';
};

// next code line will throw TypeError('Type Mismatch')
// @ts-ignore
simpleInstance.stringProp = 123;


```

That is it, it will be impossible to assign anything else except of string to `stringProp` in runtime.