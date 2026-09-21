import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { EntitlementService } from "@vertix.gg/bot/src/services/entitlement-service";
import type { Client, Entitlement } from "discord.js";

/**
 * Discord telling us a server's entitlements changed.
 *
 * Only to drop what was remembered - what a server holds is read back from discord rather than
 * pieced together from the events, because an event can be missed while the bot is down and an
 * answer read fresh cannot be.
 *
 * `subscriptionUpdate` is deliberately not listened to. It is the only signal a cancellation gives,
 * but a `Subscription` carries no guild id to forget by; the entitlement's own ending time is what
 * the service caches against instead, which needs no event at all.
 */
export function entitlementHandler( client: Client ) {
    const forget = ( entitlement: Entitlement ) => {
        if ( ! entitlement.guildId ) {
            return;
        }

        ServiceLocator.$.get<EntitlementService>( "VertixBot/Services/Entitlement" )
            ?.forget( entitlement.guildId );
    };

    client.on( "entitlementCreate", forget );
    client.on( "entitlementUpdate", ( _oldEntitlement, newEntitlement ) => forget( newEntitlement ) );
    client.on( "entitlementDelete", forget );
}
