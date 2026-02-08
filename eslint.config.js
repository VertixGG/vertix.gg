import { zLintGetConfig } from "@zenflux/eslint";

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
    ...tests,
    {
        ignores: [
            'packages/vertix-base/src/encryption/decrypt.ts',
            'packages/vertix-base/src/encryption/encrypt.ts'
        ]
    },
    {
        files: [
            "apps/**/*.{ts,tsx}",
            "packages/**/*.{ts,tsx}",
        ],
        rules: {
            "import/no-unresolved": [ "error", {
                ignore: [
                    "\\.css$",
                    "\\.scss$",
                    "\\.png$",
                    "\\.svg$",
                    "\\.jpg$",
                    "\\.webp$",
                ]
            } ]
        }
    }
];

export default config;
