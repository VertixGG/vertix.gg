import { zLintGetConfig } from "@zenflux/eslint";
import stylistic from "@stylistic/eslint-plugin";
import util from "node:util";
/** @type {import('eslint').Linter.FlatConfig[]} */
export const tests = [
    {
        ignores: [
            "**/eslint.config.*",
            "**/*jest.config.ts",
        ],
    },
    {
        files: [
            "packages/*/test/**/*.{ts,tsx,spec.ts}",
        ],
        rules: {
            // Disable `@typescript-eslint/no-unused-vars` for test files
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
];

const baseConfig = await zLintGetConfig();

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
    ... baseConfig,
    {
        plugins: {
            '@stylistic': stylistic
        },
        rules: {
            // Stylistic rules for consistent spacing
            "@stylistic/space-in-parens": [ "error", "always" ],
            "@stylistic/space-before-function-paren": [ "error", "never" ],
            "@stylistic/space-before-blocks": [ "error", "always" ],
            "@stylistic/template-curly-spacing": [ "error", "never" ],
            "@stylistic/array-bracket-spacing": [ "error", "always" ],
            "@stylistic/object-curly-spacing": [ "error", "always" ],
            "@stylistic/computed-property-spacing": [ "error", "always" ],
            "@stylistic/keyword-spacing": [ "error", { 
                "before": true, 
                "after": true,
                "overrides": {
                    "if": { "after": false },
                    "for": { "after": false },
                    "while": { "after": false },
                    "switch": { "after": false },
                    "catch": { "after": false }
                }
            }],
            
            // Import restrictions
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['/src/*'],
                            message: 'Imports from /src/* are restricted. monorepo imports e.g. @vertix/bot/src/index.ts should be used instead.'
                        }
                    ]
                }
            ]
        }
    },
    ...tests,
    {
        ignores: [
            'packages/vertix-base/src/encryption/decrypt.ts',
            'packages/vertix-base/src/encryption/encrypt.ts'
        ]
    }
];

export default config;
