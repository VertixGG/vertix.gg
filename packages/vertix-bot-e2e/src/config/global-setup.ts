import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { ensureGuildSpeaksEnglish } from "@vertix.gg/bot-e2e/src/discord/guild-language";
import { resetTestGuild } from "@vertix.gg/bot-e2e/src/vertix/guild-reset";

const run = promisify( execFile );

const CATALOG_SCRIPT = "scripts/dump-bot-catalog.ts";

/**
 * Built before every run rather than committed, so the suite is always testing against what the bot
 * currently declares - a command added this morning is covered this afternoon, and one removed stops
 * being asserted instead of failing for a reason that is no longer true.
 *
 * The guild is emptied here too, once, rather than before each test: discord's channel rate limit is
 * the binding constraint on this suite, and a per-test reset spends the whole budget on setup.
 */
async function globalSetup(): Promise<void> {
    const config = E2EConfig.$;

    config.assertUsable();

    const { stdout } = await run( "bun", [ "run", CATALOG_SCRIPT ], { cwd: config.packageRoot } );

    process.stdout.write( stdout );

    const reset = await resetTestGuild();

    process.stdout.write(
        `guild reset: removed ${ reset.removedMasters } generators, ${ reset.removedChannels } channels\n`
    );

    const language = await ensureGuildSpeaksEnglish();

    process.stdout.write( `guild language: was "${ language }"\n` );
}

export default globalSetup;
