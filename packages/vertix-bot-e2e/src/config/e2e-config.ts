import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvFile } from "@vertix.gg/bot-e2e/src/config/env-file";
import { E2E_PATHS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";

export interface IE2EConfigValues {
    guildId: string;
    destructiveGuildId: string;
    applicationName: string;
    commandChannelId: string;
    secondMemberId: string | null;
    botToken: string;
    headless: boolean;
    interactiveLoginAllowed: boolean;
    interactiveLoginTimeoutMs: number;
    slowMotionMs: number;
}

const REQUIRED_VARIABLES = [
    "E2E_DISCORD_GUILD_ID",
    "E2E_DISCORD_DESTRUCTIVE_GUILD_ID",
    "E2E_DISCORD_APP_NAME",
    "E2E_DISCORD_COMMAND_CHANNEL_ID"
] as const;

function readFlag( name: string, fallback: boolean ): boolean {
    const raw = process.env[ name ];

    if ( undefined === raw || "" === raw ) {
        return fallback;
    }

    return "1" === raw || "true" === raw.toLowerCase();
}

function readNumber( name: string, fallback: number ): number {
    const parsed = Number( process.env[ name ] );

    return Number.isFinite( parsed ) ? parsed : fallback;
}

/**
 * Everything the suite is allowed to know about the outside world.
 *
 * The guild is stated twice on purpose. `E2E_DISCORD_GUILD_ID` says where to run, and
 * `E2E_DISCORD_DESTRUCTIVE_GUILD_ID` says which guild may be written to and emptied - and the two
 * have to agree before a single test starts. One variable would make a typo enough to point a suite
 * that deletes every generator at a real community; two independent statements mean a mistake has
 * to be made the same way twice.
 */
export class E2EConfig {
    private static instance: E2EConfig | null = null;

    private readonly values: IE2EConfigValues;

    private readonly root: string;

    public static get $(): E2EConfig {
        if ( ! E2EConfig.instance ) {
            E2EConfig.instance = new E2EConfig();
        }

        return E2EConfig.instance;
    }

    private constructor() {
        this.root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), "../../../.." );

        loadEnvFile( this.root );

        this.values = {
            guildId: process.env.E2E_DISCORD_GUILD_ID ?? "",
            destructiveGuildId: process.env.E2E_DISCORD_DESTRUCTIVE_GUILD_ID ?? "",
            applicationName: process.env.E2E_DISCORD_APP_NAME ?? "",
            commandChannelId: process.env.E2E_DISCORD_COMMAND_CHANNEL_ID ?? "",
            secondMemberId: process.env.E2E_DISCORD_SECOND_MEMBER_ID || null,
            botToken: process.env.E2E_DISCORD_BOT_TOKEN ?? process.env.DISCORD_BOT_TOKEN ?? "",
            headless: readFlag( "E2E_HEADLESS", true ),
            interactiveLoginAllowed: readFlag( "E2E_INTERACTIVE_LOGIN", ! process.env.CI ),
            interactiveLoginTimeoutMs: readNumber( "E2E_LOGIN_TIMEOUT_MS", E2E_TIMEOUTS.INTERACTIVE_LOGIN_MS ),
            slowMotionMs: readNumber( "E2E_SLOW_MOTION_MS", 0 )
        };
    }

    public get repositoryRoot(): string {
        return this.root;
    }

    public get packageRoot(): string {
        return path.join( this.root, "packages/vertix-bot-e2e" );
    }

    public get guildId(): string {
        return this.values.guildId;
    }

    public get applicationName(): string {
        return this.values.applicationName;
    }

    public get commandChannelId(): string {
        return this.values.commandChannelId;
    }

    public get secondMemberId(): string | null {
        return this.values.secondMemberId;
    }

    public get botToken(): string {
        return this.values.botToken;
    }

    public get headless(): boolean {
        return this.values.headless;
    }

    public get interactiveLoginAllowed(): boolean {
        return this.values.interactiveLoginAllowed;
    }

    public get interactiveLoginTimeoutMs(): number {
        return this.values.interactiveLoginTimeoutMs;
    }

    public get slowMotionMs(): number {
        return this.values.slowMotionMs;
    }

    public get authStatePath(): string {
        return path.join( this.packageRoot, E2E_PATHS.AUTH_STATE );
    }

    /**
     * The second member's session.
     *
     * A claim only opens when the owner leaves a channel somebody else is still in, a knock is a
     * request somebody else answers, and a transfer needs somebody to transfer to. None of that can be
     * faked from one account - the bot is reacting to two voice states and two interactions - so the
     * suite keeps a second signed-in session and drives it as a second person.
     *
     * Optional. Everything that needs it skips with a reason when it is not there.
     */
    public get secondAuthStatePath(): string {
        return path.join( this.packageRoot, E2E_PATHS.AUTH_STATE_SECOND );
    }

    public hasSecondSession(): boolean {
        return fs.existsSync( this.secondAuthStatePath );
    }

    public get catalogPath(): string {
        return path.join( this.packageRoot, E2E_PATHS.CATALOG );
    }

    public get languageSourcePath(): string {
        return path.join( this.root, E2E_PATHS.LANGUAGE_SOURCE );
    }

    public get guildUrl(): string {
        return `https://discord.com/channels/${ this.values.guildId }`;
    }

    public channelUrl( channelId: string ): string {
        return `${ this.guildUrl }/${ channelId }`;
    }

    public hasStoredSession(): boolean {
        return fs.existsSync( this.authStatePath );
    }

    /**
     * Read before anything opens a browser. Everything it refuses is a reason the run would have
     * been meaningless or unsafe rather than merely failing.
     */
    public assertUsable(): void {
        const missing = REQUIRED_VARIABLES.filter( ( name ) => ! process.env[ name ] );

        if ( missing.length ) {
            throw new Error(
                `Missing required e2e configuration: ${ missing.join( ", " ) }.\n` +
                "Copy the E2E_ block from example.env into .env and fill it in."
            );
        }

        if ( this.values.guildId !== this.values.destructiveGuildId ) {
            throw new Error(
                "Refusing to run: E2E_DISCORD_GUILD_ID and E2E_DISCORD_DESTRUCTIVE_GUILD_ID disagree.\n" +
                `  running in       : ${ this.values.guildId }\n` +
                `  writes allowed in: ${ this.values.destructiveGuildId }\n` +
                "This suite deletes every generator in the guild it runs against, so both have to " +
                "name the same dedicated test guild."
            );
        }

        if ( ! this.values.botToken ) {
            throw new Error(
                "Missing bot token. Set E2E_DISCORD_BOT_TOKEN, or let it fall back to DISCORD_BOT_TOKEN in .env.\n" +
                "It is used to clear the guild between tests, never to answer interactions."
            );
        }
    }
}
