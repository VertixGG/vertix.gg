import { Client } from "discord.js";

import { AppManager } from "@vertix/managers/app-manager";

export async function readyHandler( client: Client ) {
    return new Promise( ( resolve ) => {
        const initialClient = client,
            botReady = async () => {
                await AppManager.$.onReady( client );

                resolve( true );
            };

        // Sometimes but connected so fast that the ready event is not fired.
        if ( client.isReady() ) {
            return botReady();
        }

        initialClient.on( "ready", botReady );
    } );
}
