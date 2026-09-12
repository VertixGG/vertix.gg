import { useEffect, useState } from "react";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";

import type { CustomizationData } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

/**
 * The overrides a guild holds, for screens outside the interface editor.
 *
 * One request per guild for the page, because more than one panel wants the same answer: what a
 * button is actually called. A screen that says "shown to users" and then prints the name the bot
 * shipped with is telling an admin about a channel nobody has.
 */
const byGuild = new Map<string, Promise<CustomizationData | null>>();

export function useGuildCustomization(): CustomizationData | null {
    const guildId = useSelectedGuildId();

    const [ customization, setCustomization ] = useState<CustomizationData | null>( null );

    useEffect( () => {
        if ( ! guildId ) {
            setCustomization( null );
            return;
        }

        let isMounted = true;

        let promise = byGuild.get( guildId );

        if ( ! promise ) {
            promise = apiClient.get<CustomizationData>( `/customization/guild/${ guildId }` )
                .then( ( response ) => response.data )
                // An override nobody can read is not worth failing a settings page over - the
                // names simply stay the ones the component ships with.
                .catch( () => null );

            byGuild.set( guildId, promise );
        }

        void promise.then( ( data ) => {
            if ( isMounted ) {
                setCustomization( data );
            }
        } );

        return () => {
            isMounted = false;
        };
    }, [ guildId ] );

    return customization;
}
