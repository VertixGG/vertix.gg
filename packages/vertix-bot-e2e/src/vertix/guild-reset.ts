import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";

const run = promisify( execFile );

const RESET_SCRIPT = "scripts/reset-test-guild.ts";

export interface IGuildResetResult {
    guildId: string;
    removedMasters: number;
    removedChannels: number;
}

/**
 * The clean slate every test starts from.
 *
 * Runs out of process under bun rather than inside playwright, because it reaches for the bot's own
 * prisma client to find out which voice channels are generators - the only authority on that - and
 * that client is built for bun's resolution rather than playwright's.
 */
export async function resetTestGuild(): Promise<IGuildResetResult> {
    const config = E2EConfig.$;

    config.assertUsable();

    const { stdout } = await run( "bun", [ "run", RESET_SCRIPT ], {
        cwd: config.packageRoot,
        timeout: E2E_TIMEOUTS.GUILD_RESET_MS * 2,
        env: { ...process.env }
    } );

    const lastLine = stdout.trim().split( "\n" ).at( -1 ) ?? "";

    try {
        return JSON.parse( lastLine );
    } catch {
        throw new Error( `Guild reset did not report a result.\n${ stdout }` );
    }
}

export function resetScriptPath(): string {
    return path.join( E2EConfig.$.packageRoot, RESET_SCRIPT );
}
