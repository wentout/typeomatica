module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/test/**/index.ts'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			tsconfig: './tsconfig.jest.json'
		}]
	}
};
