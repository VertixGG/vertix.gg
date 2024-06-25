import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

import type { Client } from "discord.js";

export async function readyHandler( client: Client<true> ) {
    const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" );

    return new Promise( ( resolve ) => {
        const initialClient = client,
            botReady = async () => {
                await appService.onReady( client );

                resolve( true );
            };

        // Sometimes but connected so fast that the ready event is not fired.
        if ( client.isReady() ) {
            return botReady();
        }

        initialClient.on( "ready", botReady );
    } );
}
