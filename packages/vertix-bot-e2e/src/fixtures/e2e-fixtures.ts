import { chromium, test as base } from "@playwright/test";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { DISCORD_CONTEXT_PERMISSIONS, discordLaunchArgs } from "@vertix.gg/bot-e2e/src/discord/browser-launch";
import { signedInAccountId } from "@vertix.gg/bot-e2e/src/discord/account-check";
import { DiscordRest } from "@vertix.gg/bot-e2e/src/discord/discord-rest";
import { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";
import { DiscordSession } from "@vertix.gg/bot-e2e/src/discord/discord-session";
import { GuildState } from "@vertix.gg/bot-e2e/src/discord/guild-state";
import { resetTestGuild } from "@vertix.gg/bot-e2e/src/vertix/guild-reset";
import { VertixDynamicChannel } from "@vertix.gg/bot-e2e/src/vertix/vertix-dynamic-channel";
import { VertixGenerator } from "@vertix.gg/bot-e2e/src/vertix/vertix-generator";
import { VertixScreen } from "@vertix.gg/bot-e2e/src/vertix/vertix-screen";

import type { IDynamicChannelHandle } from "@vertix.gg/bot-e2e/src/vertix/vertix-dynamic-channel";
import type { IGeneratorHandle } from "@vertix.gg/bot-e2e/src/vertix/vertix-generator";
import type { Page } from "@playwright/test";

interface ISharedGenerators {
    v3: IGeneratorHandle | null;
    v2: IGeneratorHandle | null;
}

interface ISharedGeneratorRequest {
    store: ISharedGenerators;
    version: "v2" | "v3";
    exists: ( channelId: string ) => Promise<boolean>;
    create: () => Promise<IGeneratorHandle>;
}

/**
 * One generator per interface, for the whole run.
 *
 * It was per spec file, which the guild will not allow: a guild caps generators - two, here - and
 * rebuilding one for every file accumulates them until the bot answers "you have reached your master
 * channels limit", the wizard never reaches step one, and every test that wanted a channel times out
 * complaining about something else entirely.
 *
 * Run-scoped fits the cap exactly: one v3 and one v2. A generator is configuration rather than state
 * and no test mutates the one it is handed, so sharing it costs nothing that per-file sharing bought.
 *
 * When neither is remembered the guild is emptied first, because whatever is in it came from tests
 * that asked for an empty guild and built their own - and those count against the same cap.
 */
async function resolveSharedGenerator( request: ISharedGeneratorRequest ): Promise<IGeneratorHandle> {
    const { store, version } = request;

    const remembered = store[ version ];

    if ( remembered && await request.exists( remembered.channelId ) ) {
        return remembered;
    }

    if ( ! store.v3 && ! store.v2 ) {
        await resetTestGuild();
    }

    const created = await request.create();

    store[ version ] = created;

    return created;
}

export interface IE2EWorkerFixtures {
    sharedGenerator: ISharedGenerators;
    discordPage: Page;
    secondMemberPage: Page | null;
}

export interface IE2EFixtures {
    emptyGuild: void;
    guild: GuildState;
    app: DiscordApp;
    screen: VertixScreen;
    generators: VertixGenerator;
    dynamicChannels: VertixDynamicChannel;
    v3Generator: IGeneratorHandle;
    v2Generator: IGeneratorHandle;
    ownedChannel: IDynamicChannelHandle;
    ownedV2Channel: IDynamicChannelHandle;
    secondMember: DiscordApp | null;
}

/**
 * How much of the guild each test gets to itself.
 *
 * Discord rate-limits creating and deleting channels hard enough that rebuilding the guild for every
 * test is not a thing this suite can do: emptying it and running the wizard again costs six channel
 * operations before a single member has joined anything, and a hundred tests of that gets the bot
 * told it may not create channels at all - which the bot reports, correctly, as "your channel could
 * not be created".
 *
 * So isolation is spent where it buys something:
 *
 * - the guild is emptied **once per run**, in global setup;
 * - a generator is built **once per spec file** and shared by its tests, since a generator is
 *   configuration rather than state and no test mutates the one it was handed;
 * - a dynamic channel is **per test**, because that is the thing tests actually change, and it costs
 *   one create and one delete because leaving deletes it.
 *
 * A test that genuinely needs an empty guild - the wizard's, and the hub's first-run screen - asks for
 * `emptyGuild` and pays for it.
 */
export const test = base.extend<IE2EFixtures, IE2EWorkerFixtures>( {
    sharedGenerator: [ async( {}, use ) => {
        await use( { v3: null, v2: null } );
    }, { scope: "worker" } ],

    /**
     * One discord client for the whole run.
     *
     * A context per test means the discord client boots from nothing every time - eight of the eleven
     * seconds a one-command test used to take, and most of an hour across the full suite. There is one
     * account and one worker, so tests cannot overlap anyway; sharing the page costs nothing that
     * running them serially had not already spent.
     *
     * What it does cost is playwright's own per-test video and trace, which attach to a context it
     * owns. A screenshot is attached by hand below when a test fails, which is what today's debugging
     * actually used.
     */
    discordPage: [ async( { browser }, use ) => {
        const context = await browser.newContext( {
            storageState: E2EConfig.$.authStatePath,
            permissions: [ ...DISCORD_CONTEXT_PERMISSIONS ]
        } );

        const page = await context.newPage();

        await new DiscordApp( page ).openGuild();

        await use( page );

        await context.close();

        await browser.close();
    }, { scope: "worker" } ],

    page: async( { discordPage }, use ) => {
        await use( discordPage );
    },

    /**
     * A second discord client, signed in as somebody else, sharing the run the way the first one does.
     *
     * Null when no second session has been saved, so the whole suite still runs on one account and the
     * tests that need two say why they skipped.
     */
    secondMemberPage: [ async( {}, use ) => {
        const accountId = E2EConfig.$.hasSecondSession()
            ? signedInAccountId( E2EConfig.$.secondAuthStatePath )
            : null;

        // Signed in is not the same as present. An account that never joined the test guild can hold a
        // perfectly good discord session and still be unable to join a voice channel in it, which
        // would fail every test here for a reason none of them is about.
        const present = accountId
            ? await new DiscordRest( E2EConfig.$.botToken )
                .guildMember( E2EConfig.$.guildId, accountId )
                .then( () => true )
                .catch( () => false )
            : false;

        if ( ! present ) {
            if ( accountId ) {
                process.stdout.write(
                    `second member: ${ accountId } is signed in but is not a member of guild ` +
                    `${ E2EConfig.$.guildId } - the tests that need two people will skip\n`
                );
            }

            await use( null );

            return;
        }

        // Its own browser, not just its own context. Sharing one with the first client wedged it: the
        // first is frequently sitting in a voice call, and the second could not so much as commit a
        // navigation within ninety seconds. Two processes cost a little memory and nothing else.
        const browser = await chromium.launch( { headless: E2EConfig.$.headless, args: discordLaunchArgs() } );

        const context = await browser.newContext( {
            storageState: E2EConfig.$.secondAuthStatePath,
            permissions: [ ...DISCORD_CONTEXT_PERMISSIONS ]
        } );

        const page = await context.newPage();

        await new DiscordApp( page, signedInAccountId( E2EConfig.$.secondAuthStatePath ) ).openGuild();

        if ( ! await DiscordSession.isSignedIn( page ) ) {
            throw new Error(
                "The second member's saved session is no longer accepted by discord.\n" +
                "Sign it in again with `bun run vertix:bot:e2e:login:second`."
            );
        }

        await use( page );

        await context.close();

        await browser.close();
    }, { scope: "worker" } ],

    emptyGuild: async( { sharedGenerator }, use ) => {
        await resetTestGuild();

        sharedGenerator.v3 = null;

        sharedGenerator.v2 = null;

        await use();
    },

    guild: async( {}, use ) => {
        await use( new GuildState() );
    },

    app: async( { page }, use, testInfo ) => {
        const app = new DiscordApp( page );

        await app.settle();

        await app.openCommandChannel();

        // Once per session, and before any test opens a picker: a user select can only offer members
        // this client has cached, so without it inviting somebody who has not been seen is impossible.
        await app.ensureMembersLoaded();

        await use( app );

        await app.settle();

        if ( "passed" !== testInfo.status ) {
            await testInfo.attach( "screenshot", {
                body: await page.screenshot().catch( () => Buffer.alloc( 0 ) ),
                contentType: "image/png"
            } );
        }

        await app.voice.disconnect().catch( () => undefined );
    },

    screen: async( { app }, use ) => {
        await use( new VertixScreen( app ) );
    },

    generators: async( { app, guild, screen }, use ) => {
        await use( new VertixGenerator( app, guild, screen ) );
    },

    dynamicChannels: async( { app, guild }, use ) => {
        await use( new VertixDynamicChannel( app, guild ) );
    },

    v3Generator: async( { app, guild, generators, sharedGenerator }, use ) => {
        await use( await resolveSharedGenerator( {
            store: sharedGenerator,
            version: "v3",
            exists: ( channelId ) => guild.channelExists( channelId ),
            create: async() => {
                await app.openCommandChannel();

                return generators.createV3();
            }
        } ) );
    },

    /**
     * A generator running the older interface, which a guild can have beside a v3 one - and which
     * decides a different adapter for every command and a different panel for every channel.
     */
    v2Generator: async( { app, guild, generators, sharedGenerator }, use ) => {
        await use( await resolveSharedGenerator( {
            store: sharedGenerator,
            version: "v2",
            exists: ( channelId ) => guild.channelExists( channelId ),
            create: async() => {
                await app.openCommandChannel();

                return generators.createV2();
            }
        } ) );
    },

    ownedChannel: async( { v3Generator, dynamicChannels }, use ) => {
        const channel = await dynamicChannels.open( v3Generator.channelId, "v3" );

        await use( channel );

        await dynamicChannels.close( channel ).catch( () => undefined );
    },

    secondMember: async( { secondMemberPage }, use ) => {
        if ( ! secondMemberPage ) {
            await use( null );

            return;
        }

        const app = new DiscordApp( secondMemberPage, signedInAccountId( E2EConfig.$.secondAuthStatePath ) );

        // This client gets the same clearing the primary does. Without it discord's own popups sit
        // over the second member's app unnoticed - nobody is watching that browser - and every click
        // it makes lands on the overlay instead.
        await app.settle();

        await use( app );

        await app.voice.disconnect().catch( () => undefined );
    },

    ownedV2Channel: async( { v2Generator, dynamicChannels }, use ) => {
        const channel = await dynamicChannels.open( v2Generator.channelId, "v2" );

        await use( channel );

        await dynamicChannels.close( channel ).catch( () => undefined );
    }
} );

export { expect } from "@playwright/test";
