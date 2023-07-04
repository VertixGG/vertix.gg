import assert from "assert";

import chalk from "chalk";

import { Client, Partials } from "discord.js";

import login from "@vertix-base/discord/login";

import * as handlers from "./listeners/";

import GlobalLogger from "./global-logger";

import { AppManager } from "@vertix/managers/app-manager";
import { TopGGManager } from "@vertix/managers/top-gg-manager";
import { UIManager } from "@vertix/ui-v2/ui-manager";

export default async function Main() {
    const logger = GlobalLogger.$;

    logger.log( Main, "Bot is starting..." );

    const client = new Client( {
        intents: [
            "GuildIntegrations",
            "GuildInvites",
            // "GuildMembers",
            "Guilds",
            "GuildVoiceStates",
            "DirectMessages",
        ],
        partials: [
            Partials.Channel,
        ]
    } );

    if ( AppManager.isDebugOn( "DISCORD", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( chalk.red( "DISCORD" ), "", args );
        };

        [
            "debug",
            "warn",
            "error",
            "shardError",
        ].forEach( ( event ) => {
            if ( AppManager.isDebugOn( "DISCORD", event ) ) {
                client.on( event, debug );
            }
        } );
    }

    if ( AppManager.isDebugOn( "DISCORD_REST", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( chalk.red( "DISCORD REST" ), "", args );
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
            if ( AppManager.isDebugOn( "DISCORD_REST", event ) ) {
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

            await handler( client );

            logger.log( onLogin, `Handler '${ handler.name }' registered` );
        }

        logger.log( onLogin, "All listeners registered" );

        await TopGGManager.$.handshake();
    }

    await UIManager.$.register();

    await login( client, onLogin );
}
