import type { IZConfig } from "@zenflux/cli";

const config: IZConfig = {
    format: [ "es" ],

    extensions: [ ".ts" ],

    inputPath: "src/index.ts",

    outputName: "@vertix/bot",
    outputFileName: "vertix-bot",

    external: [
        "dotenv",
        "cross-fetch",
        "discord.js",
        "prisma",
        "picocolors",
        "tough-cookie"
    ],

    omitWarningCodes: [
        "THIS_IS_UNDEFINED"
    ]
};

export default config;
