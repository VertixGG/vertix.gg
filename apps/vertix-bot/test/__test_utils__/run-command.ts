import { jest } from "@jest/globals";

import { ChannelType, PermissionsBitField } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    getHarnessChannels,
    getWorldVersionNumber,
    recordShown,
    resetShown
} from "@vertix.gg/bot/test/__test_utils__/harness";

import type { CommandInteraction } from "discord.js";

/**
 * Function aCommandInteraction() :: What discord hands the bot when a member types one.
 *
 * Only the parts the bot reads. Everything it might reply with is recorded rather than sent, and
 * that recording is what a test asserts on - it is the nearest thing to "what the member saw" that
 * exists without discord.
 */
export function aCommandInteraction( options: {
    commandName: string;
    subcommand?: string;
    userId: string;
    channelId: string;
    voiceChannelId?: string;
    isAdmin?: boolean;
} ): CommandInteraction<"cached"> {
    const channels = getHarnessChannels();

    const asDiscordChannel = ( id: string | undefined ) => {
        const channel = channels.find( ( item ) => item.channelId === id );

        if ( ! channel ) {
            return null;
        }

        return {
            id: channel.channelId,
            name: channel.name,
            type: channel.type,
            guild: { id: "guild-1", name: "Test Guild", memberCount: 2 },

            // Nothing is overwritten per member in these worlds - a channel with its generator's
            // defaults, which is what a feature opening on it reads.
            permissionOverwrites: { cache: new Map() },

            members: new Map(),

            permissionsFor: () => new PermissionsBitField( [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.Connect
            ] )
        };
    };

    const cache = new Map( channels.map( ( channel ) => [ channel.channelId, asDiscordChannel( channel.channelId ) ] ) );

    const interaction = {
        id: "interaction-1",
        guildId: "guild-1",
        commandName: options.commandName,
        channelId: options.channelId,
        // A channel the world does not know about - an ordinary text channel someone typed in - still
        // has to carry the surface the bot reads, or the test fails on the mock rather than the bot.
        channel: asDiscordChannel( options.channelId ) ?? {
            id: options.channelId,
            name: "general",
            type: ChannelType.GuildText,
            guild: { id: "guild-1", name: "Test Guild", memberCount: 2 },
            permissionOverwrites: { cache: new Map() },
            members: new Map(),
            permissionsFor: () => new PermissionsBitField( [ PermissionsBitField.Flags.ViewChannel ] )
        },
        user: { id: options.userId, username: options.userId },
        replied: false,
        deferred: false,

        member: {
            id: options.userId,
            displayName: options.userId,
            voice: { channelId: options.voiceChannelId ?? null }
        },

        memberPermissions: new PermissionsBitField(
            options.isAdmin
                ? [
                    PermissionsBitField.Flags.ManageGuild,
                    PermissionsBitField.Flags.ManageChannels,
                    PermissionsBitField.Flags.ManageRoles
                ]
                : []
        ),

        guild: {
            id: "guild-1",
            name: "Test Guild",
            memberCount: 2,
            channels: {
                cache,
                fetch: async( id: string ) => asDiscordChannel( id )
            },
            // The bot holds Administrator, as it does in a server that has just added it. Without
            // that, every requirement check walks the whole permission model looking for what is
            // missing, and a test would be asserting against the mock rather than against the bot.
            members: {
                cache: new Map( [ [ "bot", {
                    id: "bot",
                    permissions: new PermissionsBitField( [ PermissionsBitField.Flags.Administrator ] )
                } ] ] ),
                fetch: async() => interaction.member
            },
            client: { user: { id: "bot", username: "TestVC" } }
        },

        isCommand: () => true,
        isChatInputCommand: () => true,
        isMessageComponent: () => false,
        isModalSubmit: () => false,

        options: {
            getSubcommand: () => options.subcommand ?? null
        },

        reply: async() => undefined,
        showModal: async() => undefined,
        editReply: async() => undefined
    };

    return interaction as unknown as CommandInteraction<"cached">;
}

/**
 * Function withRecordingUIService() :: A ui service that remembers instead of sending.
 *
 * Every adapter the bot reaches for answers here, and every way it can put something in front of a
 * member - opening a screen, opening a modal, running an entity's handler - is written down.
 */
export function withRecordingUIService() {
    resetShown();

    const adapterFor = ( adapterName: string ) => ( {
        getName: () => adapterName,

        ephemeral: async( _interaction: unknown, args?: Record<string, unknown> ) => {
            recordShown( { kind: "screen", adapter: adapterName, args } );
        },

        ephemeralWithStep: async( _interaction: unknown, step: string ) => {
            recordShown( { kind: "screen", adapter: adapterName, args: { _step: step } } );
        },

        // Answers true the way the real one does when the modal reaches the screen - the bridge
        // reads it now, and a stub that answered nothing looked like every modal had failed.
        showModal: async( modalName: string ) => {
            recordShown( { kind: "modal", name: modalName } );

            return true;
        },

        updateInteractionDefer: async() => undefined,
        getStartedMessages: () => ( {} )
    } );

    const uiService = { get: ( adapterName: string ) => adapterFor( adapterName ) };

    // The bot asks the versioning service which interface a channel's generator runs, never the row
    // itself - so the world answers where the bot asks.
    const versioningService = { determineVersion: async() => getWorldVersionNumber() };

    const services: Record<string, unknown> = {
        "VertixGUI/UIService": uiService,
        "VertixGUI/UIVersioningAdapterService": versioningService
    };

    jest.spyOn( ServiceLocator, "$", "get" ).mockImplementation( () => ( {
        get: ( serviceName: string ) => services[ serviceName ]
    } ) as never );
}
