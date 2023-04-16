import * as process from "process";

import chalk from "chalk";

import { Client, Partials } from "discord.js";

import { guiManager } from "./managers/";

import * as handlers from "./listeners/";
import * as uiEntities from "./ui/";

import GlobalLogger from "./global-logger";

import login from "./crypt";

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

    // DiscordJS Debug mode.
    if ( process.env.env_mode === "discord" ) {
        const debug = ( ... args: any[] ) => {
            logger.debug( chalk.red( "API" ), "", args );
        };

        client
            .on( "debug", debug )
            .on( "warn", debug )
            .on( "error", debug )
            .on( "shardError", debug );

        client.rest
            .on( "restDebug", debug )
            .on( "handlerSweep", debug )
            .on( "hashSweep", debug )
            .on( "invalidRequestWarning", debug )
            .on( "newListener", debug )
            .on( "rateLimited", debug )
            .on( "removeListener", debug )
            .on( "response", debug );
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
