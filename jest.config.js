module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/test/**/index.ts', '**/test/**/addition.js'],
	globals: {
		'ts-jest': {
			tsconfig: './test/tsconfig.json'
		}
	},
};