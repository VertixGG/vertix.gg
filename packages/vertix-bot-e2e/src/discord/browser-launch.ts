import path from "node:path";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_PATHS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";

/**
 * Voice is half the bot, so the browser is started with a silent fake microphone and camera - the
 * only way a headless chromium can join a voice channel without a permission prompt nobody is there
 * to answer.
 *
 * The shared disk cache matters more than it looks. Every test gets a fresh context, and a fresh
 * context with an empty cache makes the discord client download and cold-boot itself from nothing -
 * which took longer than the app-ready budget at least once. Pointing every launch at one cache
 * directory means that happens on the first test of a run and not on the hundred after it.
 */
export function discordLaunchArgs(): string[] {
    return [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
        "--disable-blink-features=AutomationControlled",
        `--disk-cache-dir=${ path.join( E2EConfig.$.packageRoot, E2E_PATHS.BROWSER_CACHE ) }`
    ];
}

export const DISCORD_CONTEXT_PERMISSIONS = [ "microphone" ] as const;
