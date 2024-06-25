import assert from "assert";

import pc from "picocolors";

import { Client, Partials } from "discord.js";

import login from "@vertix.gg/base/src/discord/login";

import { isDebugOn } from "@vertix.gg/base/src/utils/debug";

import * as handlers from "@vertix.gg/bot/src/listeners";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";
import { UIManager } from "@vertix.gg/bot/src/ui-v2/ui-manager";

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

    if ( isDebugOn( "DISCORD", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( pc.red( "DISCORD" ), "", args );
        };

        [
            "debug",
            "warn",
            "error",
            "shardError",
        ].forEach( ( event ) => {
            if ( isDebugOn( "DISCORD", event ) ) {
                client.on( event, debug );
            }
        } );
    }

    if ( isDebugOn( "DISCORD_REST", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( pc.red( "DISCORD REST" ), "", args );
        };

        [
            "restDebug",
            "handlerSweep",
            "hashSweep",
            "invalidRequestWarning",
            "newListener",
            "rateLimited",
            "removeListener",
            "response",
        ].forEach( ( event ) => {
            if ( isDebugOn( "DISCORD_REST", event ) ) {
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

    await UIManager.$.register();

    await login( client, onLogin );
}
