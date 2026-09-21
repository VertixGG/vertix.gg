import path from "node:path";

import { convertTsConfig, readTsConfig } from "@zenflux/tsconfig-to-swc";

import { fileURLToPath } from "node:url";

import type { Config } from "@jest/types";

const currentDir = path.dirname( fileURLToPath( import.meta.url ) );

const tsConfig = readTsConfig( path.join( currentDir, "test", "tsconfig.json" ) ),
    swcOptions = convertTsConfig( tsConfig );

const config: Config.InitialProjectOptions = {

    // Compiled output from an earlier build is left next to the sources it was built from, and
    // jest's default order resolves an extensionless import to the `.js` of the pair. Tests then
    // run against whatever was last built rather than against the source under test - silently, and
    // only for files that happen to have a stale sibling. Bun, which is what actually runs the api,
    // prefers the `.ts`; this makes the suite agree with it.
    moduleFileExtensions: [ "ts", "tsx", "js", "mjs", "cjs", "jsx", "json", "node" ],
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
