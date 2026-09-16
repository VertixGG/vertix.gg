import { zLintGetConfig } from "@zenflux/eslint";
import { defaultConditionNames } from "eslint-import-resolver-typescript";

/** @type {import('eslint').Linter.FlatConfig[]} */
export const tests = [
    {
        ignores: [
            "**/eslint.config.*",
            "**/*jest.config.ts",
            // The e2e suite's working directory - saved sessions, the generated catalog, reports and
            // throwaway probes. Gitignored, outside the package's tsconfig, and not source.
            "packages/vertix-bot-e2e/.e2e/**",
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
            'packages/vertix-base/src/encryption/encrypt.ts',
            // Written by `key-gen.bash`, which `scripts/ci-jest.bash` runs before the suites. It is
            // gitignored and regenerated, so the two style errors it carries cannot be fixed in the
            // file - only in the script that writes it, to no benefit. Ignored the way its two
            // siblings above already are.
            'packages/vertix-base/src/encryption/key.ts'
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
                    "\\.svg\\?raw$",
                    "\\.ttf\\?url$",
                    "\\.jpg$",
                    "\\.webp$",
                ]
            } ]
        }
    }
];

export default config;
