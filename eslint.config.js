import { zLintGetDefaultConfig } from "@zenflux/eslint";

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

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
    ...zLintGetDefaultConfig(),
    {
        rules: {
            "space-in-parens": [ "error", "always" ],
            "space-before-function-paren": ["error", "never"],
            "space-before-blocks": [ "error", "always" ],
            "template-curly-spacing": [ "error", "always" ],
            "array-bracket-spacing": [ "error", "always" ],
            "object-curly-spacing": [ "error", "always" ],
            "computed-property-spacing": [ "error", "always" ],
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
