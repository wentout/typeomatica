import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/esm/**/*.test.ts'],
		globals: false,
	},
});
