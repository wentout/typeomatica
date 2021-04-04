module.exports = {
	env: {
		node: true,
		es6: true,
	},
	extends: ['eslint:recommended'],
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {
		'indent': ['error', 'tab'],
		'key-spacing': [
			'warn',
			{
				beforeColon: true,
				afterColon: true,
				align: 'colon',
			},
		],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'no-unused-vars': 'warn',
		'no-shadow': [
			'error',
			{
				builtinGlobals: true,
				hoist: 'all',
				allow: [],
			},
		],
		'space-before-function-paren': [
			'warn', {
				'anonymous': 'always',
				'named': 'always',
				'asyncArrow': 'always'
			}
		],
		'prefer-template': 'warn',
		'prefer-spread': 'warn',
		'no-useless-concat': 'warn',
		'prefer-rest-params': 'warn',
		'prefer-destructuring': 'warn',
		'no-useless-computed-key': 'warn',
		'no-useless-constructor': 'warn',
		'no-useless-rename': 'warn',
		'no-this-before-super': 'warn',
		'no-new-symbol': 'warn',
		'no-duplicate-imports': 'warn',
		'no-confusing-arrow': 'warn',
		'no-multi-assign': 'warn',
		'no-lonely-if': 'warn',
		'newline-per-chained-call': 'warn',
		'new-cap': 'warn',
		'func-name-matching': 'error',
		// 'consistent-this' : 'error',
		'line-comment-position': [
			'warn',
			{
				position: 'above',
			},
		],
		quotes: ['error', 'single'],
		yoda: 'warn',
	},
	'overrides': [
		{
			'files': ['lib/**/*.js'],
			'rules': {
				'prefer-rest-params': 0,
				'no-redeclare': 0
			}
		}
	]

};
