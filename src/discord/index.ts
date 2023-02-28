import { Client } from "discord.js";

import GlobalLogger from "./global-logger";

import * as handlers from "./listeners";

export default function Main() {
    const logger = GlobalLogger.getInstance();

    logger.log( Main, "Bot is starting..." );

    const client = new Client( {
        intents: [
            "GuildIntegrations",
            "GuildInvites",
            "Guilds",
            "GuildVoiceStates",
        ]
    } );

    // client.on("debug", console.log)
    //     .on("warn", console.log);

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

    client.login( process.env.DISCORD_BOT_TOKEN ).then( onLogin );
}
