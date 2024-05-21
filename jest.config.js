module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/test/**/index.ts'],
	// testMatch: ['**/test/**/index.ts', '**/test/**/addition.js'],
	transform       : {
		'\\./test/*.ts$': ['ts-jest', {
			tsconfig : './tsconfig.jest.json'
		}]
	}
};
