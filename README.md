# typomatica

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