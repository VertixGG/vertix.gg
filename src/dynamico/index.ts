import chalk from "chalk";

import { Client, Partials } from "discord.js";

import { guiManager } from "./managers/";

import * as handlers from "./listeners/";
import * as uiEntities from "./ui/";

import GlobalLogger from "./global-logger";

import login from "./login";

import DynamicoManager from "@dynamico/managers/dynamico";

export default async function Main() {
    const logger = GlobalLogger.getInstance();

    logger.log( Main, "Bot is starting..." );

    // Register UI.
    Object.values( uiEntities ).forEach( ( entry ) => guiManager.register( entry ) );

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
        ]
    } );

    if ( DynamicoManager.isDebugOn( "DISCORD", "" ) ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( chalk.red( "DISCORD" ), "", args );
        };

        [
            "debug",
            "warn",
            "error",
            "shardError",
        ].forEach( ( event ) => {
            if ( DynamicoManager.isDebugOn( "DISCORD", event ) ) {
                client.on( event, debug );
            }
        } );
    }

    if ( DynamicoManager.isDebugOn( "DISCORD_REST", "" ) ) {
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
            if ( DynamicoManager.isDebugOn( "DISCORD_REST", event ) ) {
                client.rest.on( event, debug );
            }
        } );
    }

    async function onLogin() {
        logger.log( onLogin, "Bot is authenticated" );

        logger.log( onLogin, "Registering listeners..." );

        for ( const handler of Object.values( handlers ) ) {
            logger.log( onLogin, `Registering handler '${ handler.name }'...` );

            await handler( client );

            logger.log( onLogin, `Handler '${ handler.name }' registered` );
        }

        logger.log( onLogin, "All listeners registered" );
    }

    await login( client, onLogin );
}
