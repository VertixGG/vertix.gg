import assert from "assert";

import pc from "picocolors";

import { Client, Partials } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import login from "@vertix.gg/base/src/discord/login";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import * as handlers from "@vertix.gg/bot/src/listeners";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { UIAdapterService } from "@vertix.gg/bot/src/ui-v2/ui-adapter-service";

import type { ClientEvents } from "discord.js";

import type { RestEvents } from "@discordjs/rest";

export default async function Main() {
    const logger = GlobalLogger.$;

    logger.log( Main, "Bot is starting..." );

    const client = new Client( {
        intents: [
            "GuildIntegrations",
            "GuildInvites",
            "Guilds",
            "GuildVoiceStates",
            "DirectMessages",
        ],
        partials: [
            Partials.Channel,
        ],
        shards: "auto",
    } );

    if ( isDebugEnabled( "DISCORD", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( pc.red( "DISCORD" ), "", args );
        };

        const events: readonly ( keyof ClientEvents )[] = [
            "applicationCommandPermissionsUpdate",
            "autoModerationActionExecution",
            "autoModerationRuleCreate",
            "autoModerationRuleDelete",
            "autoModerationRuleUpdate",
            "cacheSweep",
            "channelCreate",
            "channelDelete",
            "channelPinsUpdate",
            "channelUpdate",
            "debug",
            "warn",
            "emojiCreate",
            "emojiDelete",
            "emojiUpdate",
            "entitlementCreate",
            "entitlementDelete",
            "entitlementUpdate",
            "error",
            "guildAuditLogEntryCreate",
            "guildAvailable",
            "guildBanAdd",
            "guildBanRemove",
            "guildCreate",
            "guildDelete",
            "guildUnavailable",
            "guildIntegrationsUpdate",
            "guildMemberAdd",
            "guildMemberAvailable",
            "guildMemberRemove",
            "guildMembersChunk",
            "guildMemberUpdate",
            "guildUpdate",
            "inviteCreate",
            "inviteDelete",
            "messageCreate",
            "messageDelete",
            "messagePollVoteAdd",
            "messagePollVoteRemove",
            "messageReactionRemoveAll",
            "messageReactionRemoveEmoji",
            "messageDeleteBulk",
            "messageReactionAdd",
            "messageReactionRemove",
            "messageUpdate",
            "presenceUpdate",
            "ready",
            "invalidated",
            "roleCreate",
            "roleDelete",
            "roleUpdate",
            "threadCreate",
            "threadDelete",
            "threadListSync",
            "threadMemberUpdate",
            "threadMembersUpdate",
            "threadUpdate",
            "typingStart",
            "userUpdate",
            "voiceStateUpdate",
            "webhookUpdate",
            "webhooksUpdate",
            "interactionCreate",
            "shardDisconnect",
            "shardError",
            "shardReady",
            "shardReconnecting",
            "shardResume",
            "stageInstanceCreate",
            "stageInstanceUpdate",
            "stageInstanceDelete",
            "stickerCreate",
            "stickerDelete",
            "stickerUpdate",
            "guildScheduledEventCreate",
            "guildScheduledEventUpdate",
            "guildScheduledEventDelete",
            "guildScheduledEventUserAdd",
            "guildScheduledEventUserRemove",
        ];

        events.forEach( ( event ) => {
            if ( isDebugEnabled( "DISCORD", event ) ) {
                client.on( event, debug );
            }
        } );
    }

    if ( isDebugEnabled( "DISCORD_REST", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( pc.red( "DISCORD REST" ), "", args );
        };

        const events: readonly ( keyof RestEvents )[] = [
            "handlerSweep",
            "hashSweep",
            "invalidRequestWarning",
            "rateLimited",
            "response",
            "restDebug"
        ];

        events.forEach( ( event ) => {
            if ( isDebugEnabled( "DISCORD_REST", event ) ) {
                client.rest.on( event, debug );
            }
        } );
    }

    async function onLogin() {
        assert( client.user );

        logger.info( onLogin, `Bot: '${ client.user.username }' is authenticated` );

        logger.log( onLogin, "Registering listeners..." );

        for ( const handler of Object.values( handlers ) ) {
            logger.log( onLogin, `Registering handler '${ handler.name }'...` );

            await handler( client as Client<true> );

            logger.log( onLogin, `Handler '${ handler.name }' registered` );
        }

        logger.log( onLogin, "All listeners registered" );

        TopGGManager.$.handshake();
    }

    await ServiceLocator.$.get<UIAdapterService>( "VertixBot/UI-V2/UIAdapterService" )
        .registerAdapters();

    await login( client, onLogin );
}
