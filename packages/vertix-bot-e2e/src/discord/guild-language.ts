import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { chromium } from "@playwright/test";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { DISCORD_CONTEXT_PERMISSIONS, discordLaunchArgs } from "@vertix.gg/bot-e2e/src/discord/browser-launch";
import { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";

const run = promisify( execFile );

const LANGUAGE_SCRIPT = "scripts/check-guild-language.ts";

const ENGLISH = "en";

const SETTLE_ATTEMPTS = 20;

const SETTLE_INTERVAL_MS = 1000;

async function readGuildLanguage(): Promise<string | null> {
    const { stdout } = await run( "bun", [ "run", LANGUAGE_SCRIPT ], { cwd: E2EConfig.$.packageRoot } );

    const parsed = JSON.parse( stdout.trim().split( "\n" ).at( -1 ) ?? "{}" ) as { language: string | null };

    return parsed.language;
}

/**
 * Puts the guild back into english before a run starts.
 *
 * The language is the one setting that changes what every other test can assert, since the rest of
 * the suite compares against `en.json`. The test that exercises it restores english when it finishes,
 * but a run that is interrupted between the two never gets there - and then every later run reads a
 * german screen and fails for a reason that has nothing to do with the bot.
 *
 * The stored value is read from the database because that is cheap; the change is made through the
 * interface because the bot caches what it read and a write behind its back would not reach it.
 *
 * English is chosen as the menu's first entry rather than by name. The bot translates the language
 * names as well - from a german guild the list reads "Englisch", "Russisch" - so there is no label to
 * match on from a locale you did not expect. The order is the code's, not a translator's.
 */
export async function ensureGuildSpeaksEnglish(): Promise<string> {
    const config = E2EConfig.$;

    const language = await readGuildLanguage();

    if ( null === language || ENGLISH === language ) {
        return language ?? ENGLISH;
    }

    const browser = await chromium.launch( { headless: config.headless, args: discordLaunchArgs() } );

    try {
        const context = await browser.newContext( {
            storageState: config.authStatePath,
            permissions: [ ...DISCORD_CONTEXT_PERMISSIONS ]
        } );

        const app = new DiscordApp( await context.newPage() );

        await app.openGuild();

        await app.openCommandChannel();

        const reply = await app.commands.run( { group: "manage", name: "language" } );

        await app.messages.chooseFirstOption(
            reply,
            BotCatalog.$.selectPlaceholder( "VertixBot/UI-General/LanguageSelectMenu" )
        );

        // Waited for rather than assumed: choosing the option only sends the interaction, and closing
        // the browser the moment the click returns outruns the bot writing the row - which the first
        // version of this did, reporting a repair that had not happened.
        await waitForEnglish();

        await context.close();
    } finally {
        await browser.close();
    }

    return language;
}

async function waitForEnglish(): Promise<void> {
    for ( let attempt = 0; attempt < SETTLE_ATTEMPTS; attempt++ ) {
        if ( ENGLISH === await readGuildLanguage() ) {
            return;
        }

        await new Promise( ( resolve ) => setTimeout( resolve, SETTLE_INTERVAL_MS ) );
    }

    throw new Error(
        `The guild is still not speaking english after ${ SETTLE_ATTEMPTS } seconds.\n` +
        "Set it by hand with /manage language before running the suite - every assertion here compares " +
        "against en.json."
    );
}
