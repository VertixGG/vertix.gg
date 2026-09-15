import path from "node:path";

import { convertTsConfig, readTsConfig } from "@zenflux/tsconfig-to-swc";

import { fileURLToPath } from "node:url";

import type { Config } from "@jest/types";

const currentDir = path.dirname( fileURLToPath( import.meta.url ) );

const tsConfig = readTsConfig( path.join( currentDir, "test", "tsconfig.json" ) ),
    swcOptions = convertTsConfig( tsConfig );

const config: Config.InitialProjectOptions = {
    testRegex: "(/test/.*\\.spec\\.ts)$",

    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest', { ...swcOptions, ... {
            inputSourceMap: ! process.argv.includes( "--ci" ),
        } } ],
    },

    extensionsToTreatAsEsm: ['.ts', '.tsx'],

    cache: ! process.argv.includes( "--ci" ),
};

export default config;
