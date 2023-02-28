import * as process from "process";

import { Client } from "discord.js";

import GlobalLogger from "../global-logger";

import { Commands } from "@internal/discord/interactions/commands/";

const logger = GlobalLogger.getInstance();

async function botReady ( client: Client, callback: Function ) {
    if ( ! client.user || ! client.application ) {
        logger.error( botReady, "Client is not ready" );
        process.exit( 1 );
        return;
    }

    await client.application.commands.set( Commands );

    logger.log( botReady, `Ready handle is set, Bot '${ client.user.username }' is online, commands is set.` );

    callback();
}

export async function readyHandler ( client: Client ) {
    return new Promise( ( resolve ) => {
        const initialClient = client;

        // Sometimes but connected so fast that the ready event is not fired.
        if ( client.isReady() ) {
            botReady( client, resolve );
            return;
        }

        initialClient.on( "ready", async () => {
            await botReady( initialClient, resolve );
        } );
    } );
}
