import { zLintGetConfig } from "@zenflux/eslint";
import { defaultConditionNames } from "eslint-import-resolver-typescript";

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

const RESOLVER_BASE = baseConfig.find( ( entry ) => entry.settings?.[ "import/resolver" ] );

const RUNTIME_CONDITION_NAMES = defaultConditionNames.filter( ( name ) => name !== "types" );

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
        files: RESOLVER_BASE.files,

        settings: {
            "import/resolver": {
                ... RESOLVER_BASE.settings[ "import/resolver" ],

                typescript: {
                    ... RESOLVER_BASE.settings[ "import/resolver" ].typescript,

                    conditionNames: RUNTIME_CONDITION_NAMES,
                },
            },
        },
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
