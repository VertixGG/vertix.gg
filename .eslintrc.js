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
	plugins: [
		"@typescript-eslint",
		"simple-import-sort",
		"unused-imports"
	],
	"rules": {
		"unused-imports/no-unused-imports": "error",
		"simple-import-sort/imports": "error",
		"simple-import-sort/exports": "error",
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
		"no-multiple-empty-lines": [
			"error",
			{
				max: 1,
			}
		],
	},
};
