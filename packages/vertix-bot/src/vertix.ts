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
        intents: [
            "GuildIntegrations",
            "GuildInvites",
            "Guilds",
            "GuildVoiceStates",
            "DirectMessages"
        ],
        partials: [ Partials.Channel ],
        shards: "auto"
    } );

    debugDiscordApiEvents( logger, client );

    debugDiscordApiRestEvents( logger, client );

    async function onLogin() {
        assert( client.user );

        logger.info( onLogin, `Bot: '${ client.user.username }' is authenticated` );

        const handlerPromises = [];

        const aiChatToken = process.env.AI_CHAT_DISCORD_TOKEN;

        for ( const handler of Object.values( handlers ) ) {
            if ( ! enableListeners && handler !== readyHandler ) {
                continue;
            }

            // Both mention handlers run on the AI client, not main client
            if ( handler === handlers.mentionHandlerPublic || handler === handlers.mentionHandlerPrivate ) {
                continue;
            }

            logger.log( onLogin, `Registering handler '${ handler.name }'...` );

            handlerPromises.push(
                handler( client as Client<true> )?.then( () => {
                    logger.log( onLogin, `Handler '${ handler.name }' registered` );
                } )
            );
        }

        if ( aiChatToken ) {
            logger.info( onLogin, "Starting separate AI Chat Bot client..." );

            const aiClient = new Client( {
                intents: [
                    "Guilds",
                    "GuildMessages",
                    "MessageContent",
                    "DirectMessages"
                ],
                partials: [ Partials.Channel ],
                shards: "auto"
            } );

            debugDiscordApiEvents( logger, aiClient );

            const onAiLogin = async() => {
                assert( aiClient.user );
                logger.info( onAiLogin, `AI Chat Bot: '${ aiClient.user.username }' is authenticated` );

                logger.log( onAiLogin, "Registering mentionHandlerPublic on AI client..." );
                await handlers.mentionHandlerPublic( aiClient as Client<true> );
                logger.log( onAiLogin, "mentionHandlerPublic registered on AI client" );

                logger.log( onAiLogin, "Registering mentionHandlerPrivate on AI client..." );
                await handlers.mentionHandlerPrivate( aiClient as Client<true> );
                logger.log( onAiLogin, "mentionHandlerPrivate registered on AI client" );

                logger.log( onAiLogin, "Registering interactionHandler on AI client..." );
                await handlers.interactionHandler( aiClient as Client<true> );
                logger.log( onAiLogin, "interactionHandler registered on AI client" );
            };

            await login( aiClient, onAiLogin, aiChatToken );
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
