import assert from "assert";

import pc from "picocolors";

import { Client, Partials } from "discord.js";

import login from "@vertix.gg/base/src/discord/login";

import { isDebugEnabled, isDebugTypeEnabled } from "@vertix.gg/utils/src/environment";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { InteractionTrace } from "@vertix.gg/base/src/modules/trace/interaction-trace";

import { UI_PEER_IDENTITIES } from "@vertix.gg/definitions/src/ui-ipc-definitions";

import * as handlers from "@vertix.gg/bot/src/listeners";

import {
    createClientCacheFactory,
    createClientSweepers
} from "@vertix.gg/bot/src/definitions/client-cache";

import {
    getOwnedShardIds,
    getShardClientOptions,
    ownsSingletonWork
} from "@vertix.gg/bot/src/definitions/sharding";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import { readyHandler } from "@vertix.gg/bot/src/listeners";

import type { UIIPCService } from "@vertix.gg/bot/src/services/ui-ipc-service";
import type { AIPromptIPCService } from "@vertix.gg/bot/src/services/ai-prompt-ipc-service";
import type { AICaptchaIPCService } from "@vertix.gg/bot/src/services/ai-captcha-ipc-service";

import type { Logger } from "@vertix.gg/base/src/modules/logger";

import type { ClientEvents } from "discord.js";

import type { InternalRequest, RateLimitData, RestEvents } from "@discordjs/rest";

function debugDiscordApiEvents( logger: Logger, client: Client<boolean> ) {
    if ( isDebugTypeEnabled( "DISCORD" ) ) {
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
    if ( isDebugTypeEnabled( "DISCORD_REST" ) ) {
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

/**
 * Times every request the bot makes to discord, and every rate limit it sits out, against the
 * interaction that made it - see `InteractionTrace`.
 *
 * `request()` is the one method every REST call goes through, and it resolves only once the
 * response is in, so the time it takes includes any queueing behind a rate limit. The REST manager
 * emits no event that carries a duration, which is why it is wrapped rather than listened to - the
 * same way `guilds.fetch` is wrapped for DEBUG_GUILD_FETCH below.
 */
function traceDiscordRest( client: Client<boolean> ) {
    if ( ! InteractionTrace.$.isEnabled() ) {
        return;
    }

    const rest = client.rest,
        originalRequest = rest.request.bind( rest );

    rest.request = ( options: InternalRequest ) => {
        const route = InteractionTrace.normalizeRoute( options.fullRoute ),
            label = `${ options.method.toUpperCase() } ${ route }`;

        return InteractionTrace.$.span( "discord", label, async() => {
            const result = await originalRequest( options );

            // The first response to an interaction callback is what stops discord from showing
            // "this interaction failed".
            if ( route.endsWith( "/callback" ) ) {
                InteractionTrace.$.markAcknowledged();
            }

            return result;
        } );
    };

    rest.on( "rateLimited", ( data: RateLimitData ) => {
        InteractionTrace.$.record(
            "discord-rate-limit",
            `${ data.method.toUpperCase() } ${ InteractionTrace.normalizeRoute( data.route ) } ( ${ data.scope }${ data.global ? ", global" : "" } )`,
            data.retryAfter
        );
    } );
}

export default async function Main( { enableListeners }: {
    enableListeners?: boolean;
} ) {
    const logger = GlobalLogger.$;

    logger.log( Main, "Bot is starting..." );

    // Said out loud because a process that is wrong about which shard it is does not fail - it
    // quietly holds guilds that belong to another one, and the only symptom is two bots answering.
    // `{"shards":"auto"}` here while SHARD_IDS is set means the pair disagreed and only one arrived.
    const shardClientOptions = getShardClientOptions();

    logger.info(
        Main,
        `Shard assignment: ${ JSON.stringify( shardClientOptions ) } ` +
        `(SHARD_COUNT='${ process.env.SHARD_COUNT ?? "" }', SHARD_IDS='${ process.env.SHARD_IDS ?? "" }')`
    );

    const client = new Client( {
        intents: [
            "GuildIntegrations",
            "Guilds",
            "GuildVoiceStates",
            // Privileged: drives the game name shown in the dynamic channel status.
            "GuildPresences",
            "DirectMessages"
        ],
        partials: [ Partials.Channel ],
        // `{ shards: "auto" }` unless SHARD_COUNT and SHARD_IDS are both set. Resolved once above
        // and reused, so what the log reports is the object the client was actually built with.
        ... shardClientOptions,
        makeCache: createClientCacheFactory(),
        sweepers: createClientSweepers()
    } );

    // Names whoever pulls a guild in over rest, which the gateway's own sharding cannot explain.
    // A rest fetch puts a guild in the cache whatever shard owns it, so on a sharded process this
    // is the one way a guild arrives that was not handed over at identify - and reading code has
    // not found the caller. The stack does.
    //
    // Off unless DEBUG_GUILD_FETCH is set, and `info` rather than `debug` because debug is a no-op
    // below LOGGER_LOG_LEVEL=6.
    if ( isDebugTypeEnabled( "GUILD_FETCH" ) ) {
        const guilds = client.guilds as unknown as { fetch: ( ... args: unknown[] ) => unknown },
            originalFetch = guilds.fetch.bind( guilds );

        guilds.fetch = ( ... args: unknown[] ) => {
            logger.info(
                Main,
                `guilds.fetch( ${ JSON.stringify( args[ 0 ] ) } ) called from:\n${ new Error().stack }`
            );

            return originalFetch( ... args );
        };

        logger.info( Main, "DEBUG_GUILD_FETCH is on - guild fetches will be traced" );
    }

    debugDiscordApiEvents( logger, client );

    debugDiscordApiRestEvents( logger, client );

    traceDiscordRest( client );

    InteractionTrace.$.start();

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
            if ( handler === handlers.mentionHandlerPublic
                || handler === handlers.mentionHandlerPrivate
                || handler === handlers.memberJoinHandler ) {
                continue;
            }

            logger.log( onLogin, `Registering handler '${ handler.name }'...` );

            handlerPromises.push(
                handler( client as Client<true> )?.then( () => {
                    logger.log( onLogin, `Handler '${ handler.name }' registered` );
                } )
            );
        }

        // The AI chat bot is a second application with its own token, not a second view of this one,
        // so it belongs to the bot rather than to any shard. Started on every shard process it would
        // open a full set of gateway connections per process and answer each mention that many
        // times. Unsharded this is always true, so nothing changes today.
        if ( aiChatToken && ! ownsSingletonWork() ) {
            logger.info(
                onLogin,
                `AI Chat Bot is not started here - shards '${ getOwnedShardIds()?.join( "," ) }' do not include 0`
            );
        } else if ( aiChatToken ) {
            logger.info( onLogin, "Starting separate AI Chat Bot client..." );

            const aiClient = new Client( {
                intents: [
                    "Guilds",
                    "GuildMessages",
                    "MessageContent",
                    "DirectMessages",
                    // Privileged, and the switch is in Discord's Developer Portal rather than
                    // here: asking for it while it is off there does not degrade, it refuses the
                    // login outright. Hence the kill switch - set AI_CHAT_MEMBER_INTENT=false and
                    // the bot comes back up without the join greeting.
                    ... ( "false" === process.env.AI_CHAT_MEMBER_INTENT?.trim() ? [] : [ "GuildMembers" as const ] )
                ],
                partials: [ Partials.Channel ],
                shards: "auto",
                // A second `Client` is a second set of caches in the same process, not a view onto
                // the first one's - a user active in both is held twice. This one carries
                // `GuildMembers` and `MessageContent`, so it is the client that would otherwise
                // accumulate a GuildMember for everyone who has ever spoken.
                makeCache: createClientCacheFactory(),
                sweepers: createClientSweepers()
            } );

            debugDiscordApiEvents( logger, aiClient );

            const onAiLogin = async() => {
                assert( aiClient.user );
                logger.info( onAiLogin, `AI Chat Bot: '${ aiClient.user.username }' is authenticated` );

                // Not awaited on purpose: the services are only registered once this callback
                // returns, so waiting here would deadlock startup. The identity lands as soon as
                // the UI IPC service is up, well before a peer can ask for it.
                void ServiceLocator.$.waitFor<UIIPCService>( "VertixBot/Services/UIIPC", {
                    silent: true,
                    timeout: 10000
                } )
                    .then( ( uiIPCService ) => {
                        uiIPCService.registerClient( UI_PEER_IDENTITIES.AI_CHAT, aiClient as Client<true> );
                    } )
                    .catch( () => {
                        logger.warn(
                            onAiLogin,
                            "UI IPC service did not come up - peers asking for the AI bot will post as the main Vertix bot"
                        );
                    } );

                // Same deal, and the same reason it is not awaited: this client's membership is
                // what resolves whoever asks the agent to change a channel's prompt.
                void ServiceLocator.$.waitFor<AIPromptIPCService>( "VertixBot/Services/AIPromptIPC", {
                    silent: true,
                    timeout: 10000
                } )
                    .then( ( aiPromptIPCService ) => {
                        aiPromptIPCService.registerClient( aiClient as Client<true> );
                    } )
                    .catch( () => {
                        logger.warn(
                            onAiLogin,
                            "AI prompt IPC service did not come up - channel prompts cannot be changed by talking"
                        );
                    } );

                // The challenge images are posted by this client too, so they come from the bot
                // the person is actually talking to.
                void ServiceLocator.$.waitFor<AICaptchaIPCService>( "VertixBot/Services/AICaptchaIPC", {
                    silent: true,
                    timeout: 10000
                } )
                    .then( ( aiCaptchaIPCService ) => {
                        aiCaptchaIPCService.registerClient( aiClient as Client<true> );
                    } )
                    .catch( () => {
                        logger.warn(
                            onAiLogin,
                            "AI captcha IPC service did not come up - captcha challenges cannot be posted"
                        );
                    } );

                logger.log( onAiLogin, "Registering mentionHandlerPublic on AI client..." );
                await handlers.mentionHandlerPublic( aiClient as Client<true> );
                logger.log( onAiLogin, "mentionHandlerPublic registered on AI client" );

                logger.log( onAiLogin, "Registering mentionHandlerPrivate on AI client..." );
                await handlers.mentionHandlerPrivate( aiClient as Client<true> );
                logger.log( onAiLogin, "mentionHandlerPrivate registered on AI client" );

                if ( "false" !== process.env.AI_CHAT_MEMBER_INTENT?.trim() ) {
                    logger.log( onAiLogin, "Registering memberJoinHandler on AI client..." );
                    await handlers.memberJoinHandler( aiClient as Client<true> );
                    logger.log( onAiLogin, "memberJoinHandler registered on AI client" );
                }

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
