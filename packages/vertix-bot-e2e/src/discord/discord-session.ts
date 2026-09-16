import fs from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_INTERVALS, E2E_TIMEOUTS, DISCORD_URLS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM } from "@vertix.gg/bot-e2e/src/discord/discord-dom";
import { discordLaunchArgs } from "@vertix.gg/bot-e2e/src/discord/browser-launch";

import type { Browser, Page } from "@playwright/test";

export interface ISessionProfile {
    label: string;
    statePath: string;
}

function primaryProfile(): ISessionProfile {
    return { label: "the main test account", statePath: E2EConfig.$.authStatePath };
}

export function secondMemberProfile(): ISessionProfile {
    return { label: "the second member", statePath: E2EConfig.$.secondAuthStatePath };
}

const LOGIN_BANNER = [
    "",
    "  ┌────────────────────────────────────────────────────────────────────────┐",
    "  │  Discord sign-in needed for {profile}                                   │",
    "  │                                                                        │",
    "  │  The saved session is gone or no longer valid, so a browser window has  │",
    "  │  opened on the discord login page.                                     │",
    "  │                                                                        │",
    "  │  Sign in there yourself - password, two-factor and any captcha. This    │",
    "  │  suite never types credentials and never answers a captcha.             │",
    "  │                                                                        │",
    "  │  The run continues on its own once the app finishes loading.           │",
    "  └────────────────────────────────────────────────────────────────────────┘",
    ""
].join( "\n" );

function headlessLoginRefusal(): Error {
    return new Error(
        "No valid discord session, and this run cannot ask for one.\n\n" +
        "Sign in once, by hand, with:\n\n" +
        "    bun run vertix:bot:e2e:login\n\n" +
        "That opens a real browser on the discord login page and saves the session for the daily runs.\n" +
        "Set E2E_INTERACTIVE_LOGIN=1 to let this run open it instead."
    );
}

/**
 * The account, and the one thing in the suite a person still has to do.
 *
 * A session is reused until discord stops accepting it. When that happens the only supported answer
 * is a human signing in: credentials are never read from the environment and a captcha is never
 * answered, so a scheduled run that finds a dead session fails with instructions rather than trying
 * to get past the login page on its own.
 */
export class DiscordSession {
    private static instance: DiscordSession | null = null;

    public static get $(): DiscordSession {
        if ( ! DiscordSession.instance ) {
            DiscordSession.instance = new DiscordSession();
        }

        return DiscordSession.instance;
    }

    public static async isSignedIn( page: Page ): Promise<boolean> {
        const navigation = page.locator( DISCORD_DOM.GUILDS_NAV );

        try {
            await navigation.waitFor( { state: "visible", timeout: E2E_TIMEOUTS.APP_READY_MS } );

            return true;
        } catch {
            return false;
        }
    }

    public async ensureAuthenticated( profile: ISessionProfile = primaryProfile() ): Promise<void> {
        const config = E2EConfig.$;

        config.assertUsable();

        if ( fs.existsSync( profile.statePath ) && await this.storedSessionWorks( profile ) ) {
            return;
        }

        if ( ! config.interactiveLoginAllowed ) {
            throw headlessLoginRefusal();
        }

        await this.signInByHand( profile );
    }

    private async storedSessionWorks( profile: ISessionProfile ): Promise<boolean> {
        const browser = await chromium.launch( {
            headless: true,
            args: discordLaunchArgs()
        } );

        try {
            const context = await browser.newContext( { storageState: profile.statePath } );

            const page = await context.newPage();

            await page.goto( E2EConfig.$.guildUrl, { waitUntil: "domcontentloaded" } );

            const signedIn = await DiscordSession.isSignedIn( page );

            if ( signedIn ) {
                await context.storageState( { path: profile.statePath } );
            }

            await context.close();

            return signedIn;
        } finally {
            await browser.close();
        }
    }

    private async signInByHand( profile: ISessionProfile ): Promise<void> {
        const config = E2EConfig.$;

        const browser: Browser = await chromium.launch( {
            headless: false,
            args: discordLaunchArgs()
        } );

        try {
            const context = await browser.newContext();

            const page = await context.newPage();

            await page.goto( DISCORD_URLS.LOGIN, { waitUntil: "domcontentloaded" } );

            process.stdout.write( LOGIN_BANNER.replace( "{profile}", profile.label ) );

            await this.waitForSignIn( page );

            await page.goto( config.guildUrl, { waitUntil: "domcontentloaded" } );

            await page.locator( DISCORD_DOM.GUILDS_NAV ).waitFor( { state: "visible", timeout: E2E_TIMEOUTS.APP_READY_MS } );

            fs.mkdirSync( path.dirname( profile.statePath ), { recursive: true } );

            await context.storageState( { path: profile.statePath } );

            process.stdout.write( `\n  Session saved to ${ profile.statePath }\n\n` );

            await context.close();
        } finally {
            await browser.close();
        }
    }

    private async waitForSignIn( page: Page ): Promise<void> {
        const deadline = Date.now() + E2EConfig.$.interactiveLoginTimeoutMs;

        while ( Date.now() < deadline ) {
            if ( await page.locator( DISCORD_DOM.GUILDS_NAV ).isVisible().catch( () => false ) ) {
                return;
            }

            await page.waitForTimeout( E2E_INTERVALS.POLL_MS );
        }

        throw new Error(
            `Nobody signed in within ${ Math.round( E2EConfig.$.interactiveLoginTimeoutMs / 1000 ) }s. ` +
            "Raise E2E_LOGIN_TIMEOUT_MS if that was not long enough."
        );
    }
}
