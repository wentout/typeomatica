const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        globals: {
            ...globals.node,
        },

        ecmaVersion: 2018,
        sourceType: "module",
        parserOptions: {},
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/eslint-recommended"),

    rules: {
        indent: ["error", "tab"],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single"],
        semi: ["error", "always"],
        "no-unused-vars": "warn",

        "no-shadow": ["error", {
            builtinGlobals: true,
            hoist: "all",
            allow: [],
        }],

        "prefer-template": "warn",
        "prefer-spread": "warn",
        "no-useless-concat": "warn",
        "prefer-rest-params": "warn",
        "prefer-destructuring": "warn",
        "no-useless-computed-key": "warn",
        "no-useless-constructor": "warn",
        "no-useless-rename": "warn",
        "no-this-before-super": "warn",
        "no-new-symbol": "warn",
        "no-duplicate-imports": "warn",
        "no-confusing-arrow": "warn",
        "no-multi-assign": "warn",
        "no-lonely-if": "warn",
        "newline-per-chained-call": "warn",
        "new-cap": "off",
        "func-name-matching": "error",

        "line-comment-position": ["warn", {
            position: "above",
        }],

        yoda: "warn",
    },
}, {
    files: ["lib/**/*.js"],

    "rules": {
        "prefer-rest-params": 0,
        "no-redeclare": 0,
    },
}, globalIgnores([])]);
