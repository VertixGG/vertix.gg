module.exports = {
	root: true,
	env: {
		node: true,
		es6: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		"ecmaVersion": "latest",
		"sourceType": "module",
	},
	extends: [
		"plugin:import/recommended",
		"plugin:import/typescript"
	],
	plugins: [
		"@typescript-eslint",
		"import"
	],
	"settings": {
		"import/parsers": {
			"@typescript-eslint/parser": [ ".ts", ".tsx" ]
		},
		"import/resolver": {
			"typescript": {
				"alwaysTryTypes": true,
			},
			"node": true,
			"project": "./tsconfig.json"
		},
	},
	"rules": {
		"@typescript-eslint/explicit-member-accessibility": [ "error" ],
		"import/no-named-as-default": "off",
		"import/first": "error",
		"import/no-duplicates": "error",
		"import/no-unresolved": "error",
		"import/newline-after-import": "error",
		"import/order": [
			"error",
			{
				"pathGroups": [
					{
						"pattern": "@internal/**",
						"group": "internal",
						"position": "after",
					},
					{
						"pattern": "@vertix/**",
						"group": "parent",
						"position": "after",
					}
				],
				"groups": [
					"builtin",
					"external",
					"index",
					"sibling",
					"parent",
					"internal",
					"object",
					"type",
					"unknown",
				],
				"newlines-between": "always-and-inside-groups",
				"distinctGroup": false,
			}
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double",
		],
		"semi": [
			"error",
			"always"
		],
		"eol-last": [
			"error",
			"always"
		],
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				"argsIgnorePattern": "^",
				"varsIgnorePattern": "^import\\s+.+;$",
			}
		],
		"no-trailing-spaces": [ "error" ],
		"no-multiple-empty-lines": [
			"error",
			{
				max: 1,
			}
		],
	},
};
