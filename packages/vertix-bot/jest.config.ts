import path from "node:path";

import { convertTsConfig, readTsConfig } from "@zenflux/tsconfig-to-swc";

import { fileURLToPath } from "node:url";

import type { Config } from "@jest/types";

const currentDir = path.dirname( fileURLToPath( import.meta.url ) );

const tsConfig = readTsConfig( path.join( currentDir, "test", "tsconfig.json" ) ),
    swcOptions = convertTsConfig( tsConfig );

// In `--ci` set `inputSourceMap`
if ( process.argv.includes( "--ci" ) ) {
    swcOptions.inputSourceMap = true;
}

const config: Config.InitialProjectOptions = {
    testRegex: "(/test/.*\\.spec\\.ts)$",

    setupFilesAfterEnv: [ "<rootDir>/test/__setup__.ts" ],

    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest', { ...swcOptions } ],
    },

    extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config;
