import path from "path";

import { zLintGetDefaultConfig, zLintSetRootPackagePath } from "@zenflux/eslint";

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
    ...tests,
];


export default config;
