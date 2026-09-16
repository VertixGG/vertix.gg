import { defineConfig } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_PATHS, E2E_TIMEOUTS, DISCORD_URLS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_CONTEXT_PERMISSIONS, discordLaunchArgs } from "@vertix.gg/bot-e2e/src/discord/browser-launch";

const SESSION_PROJECT = "discord-session";

const FEATURE_PROJECTS = [
    { name: "dom-contract", testDir: "./tests" , testMatch: "dom-contract.spec.ts" },
    { name: "commands", testDir: "./tests/commands", testMatch: "**/*.spec.ts" },
    { name: "dynamic-channel", testDir: "./tests/dynamic-channel", testMatch: "**/*.spec.ts" },
    { name: "setup", testDir: "./tests/setup", testMatch: "**/*.spec.ts" },
    { name: "claim", testDir: "./tests/claim", testMatch: "**/*.spec.ts" },
    { name: "scaling", testDir: "./tests/scaling", testMatch: "**/*.spec.ts" }
] as const;

/**
 * One account, one guild, one worker.
 *
 * Nothing here runs in parallel and nothing is retried by default. Two workers would be two browsers
 * signed into the same discord account fighting over the same voice connection, and a retry would
 * re-run a test whose first attempt already changed the guild - so a flake is reported as a flake
 * rather than hidden by a second go.
 */
export default defineConfig( {
    testDir: "./tests",

    fullyParallel: false,

    workers: 1,

    retries: 0,

    timeout: E2E_TIMEOUTS.TEST_MS,

    globalSetup: "@vertix.gg/bot-e2e/src/config/global-setup",

    outputDir: E2E_PATHS.RESULTS,

    expect: {
        timeout: E2E_TIMEOUTS.EXPECT_MS
    },

    reporter: [
        [ "list" ],
        [ "html", { outputFolder: E2E_PATHS.REPORT, open: "never" } ]
    ],

    use: {
        baseURL: DISCORD_URLS.BASE,

        // Playwright leaves these at "wait forever". A click on something that never becomes
        // clickable then hangs until the whole test times out, which reads as a frozen browser and
        // says nothing about what it was reaching for - the failure mode this suite kept producing.
        // Bounded, the same click fails in seconds and names the locator.
        actionTimeout: E2E_TIMEOUTS.ACTION_MS,

        navigationTimeout: E2E_TIMEOUTS.APP_READY_MS,

        headless: E2EConfig.$.headless,

        permissions: [ ...DISCORD_CONTEXT_PERMISSIONS ],

        launchOptions: {
            args: discordLaunchArgs(),
            slowMo: E2EConfig.$.slowMotionMs
        },

        // The suite drives one shared context of its own, which playwright's per-test artefact
        // collection cannot reach - `e2e-fixtures.ts` attaches a screenshot on failure instead.
        trace: "off",

        screenshot: "off",

        video: "off"
    },

    projects: [
        // Needs no browser, no guild and no bot, so it neither waits on the session nor spends a
        // discord round trip - and it fails in milliseconds when the bot renames an entity.
        {
            name: "catalog",
            testDir: "./tests",
            testMatch: "catalog-contract.spec.ts"
        },

        {
            name: SESSION_PROJECT,
            testDir: "./tests",
            testMatch: "auth.setup.ts"
        },

        // Run on purpose, never depended on - see `auth-second.setup.ts`.
        {
            name: "discord-session-second",
            testDir: "./tests",
            testMatch: "auth-second.setup.ts"
        },

        ...FEATURE_PROJECTS.map( ( project ) => ( {
            name: project.name,
            testDir: project.testDir,
            testMatch: project.testMatch,
            dependencies: [ SESSION_PROJECT ],
            use: { storageState: E2EConfig.$.authStatePath }
        } ) )
    ]
} );
