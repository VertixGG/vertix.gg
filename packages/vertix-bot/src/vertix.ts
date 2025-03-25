import assert from "assert";

import pc from "picocolors";

import { Client, Partials } from "discord.js";

import login from "@vertix.gg/base/src/discord/login";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import * as handlers from "@vertix.gg/bot/src/listeners";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import { readyHandler } from "@vertix.gg/bot/src/listeners";

import type { Logger } from "@vertix.gg/base/src/modules/logger";

import type { ClientEvents } from "discord.js";

import type { RestEvents } from "@discordjs/rest";

function debugDiscordApiEvents( logger: Logger, client: Client<boolean> ) {
    if ( isDebugEnabled( "DISCORD", "" ) ) {
        const debug = ( ...args: any[] ) => {
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
            "guildScheduledEventUserRemove"
        ];

        events.forEach( ( event ) => {
            if ( isDebugEnabled( "DISCORD", event ) ) {
                client.on( event, debug );
            }
        } );
    }
}

function debugDiscordApiRestEvents( logger: Logger, client: Client<boolean> ) {
    if ( isDebugEnabled( "DISCORD_REST", "" ) ) {
        const debug = ( ...args: any[] ) => {
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
}

export default async function Main( { enableListeners }: {
    enableListeners?: boolean;
} ) {
    const logger = GlobalLogger.$;

    logger.log( Main, "Bot is starting..." );

    const client = new Client( {
        intents: [ "GuildIntegrations", "GuildInvites", "Guilds", "GuildVoiceStates", "DirectMessages" ],
        partials: [ Partials.Channel ],
        shards: "auto"
    } );

    debugDiscordApiEvents( logger, client );

    debugDiscordApiRestEvents( logger, client );

    async function onLogin() {
        assert( client.user );

        logger.info( onLogin, `Bot: '${ client.user.username }' is authenticated` );

        const handlerPromises = [];

        for ( const handler of Object.values( handlers ) ) {
            if ( ! enableListeners && handler !== readyHandler ) {
                continue;
            }

            logger.log( onLogin, `Registering handler '${ handler.name }'...` );

            handlerPromises.push(
                handler( client as Client<true> )?.then( () => {
                    logger.log( onLogin, `Handler '${ handler.name }' registered` );
                } )
            );
        }

        Promise.all( handlerPromises ).then( async() => {
            logger.log( onLogin, "All listeners registered" );

            TopGGManager.$.handshake();
        } );

        logger.log( onLogin, "Registering listeners..." );
    }

    await login( client, onLogin );

    return client as Client<true>;
}
