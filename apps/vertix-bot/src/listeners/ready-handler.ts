import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

import type { Client } from "discord.js";

export async function readyHandler( client: Client<true> ) {
    await ServiceLocator.$.waitFor( "VertixBot/Services/App", {
        silent: true,
        timeout: 30000
    } );

    const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" );

    return new Promise( ( resolve ) => {
        const initialClient = client,
            botReady = async() => {
                await appService.onReady( client );

                resolve( true );
            };

        if ( client.isReady() ) {
            return botReady();
        }

        initialClient.on( "ready", botReady );
    } );
}
