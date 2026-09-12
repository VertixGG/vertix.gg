import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";

import type {
    DynamicMasterChannelInfo,
    GuildGeneratorsDetails
} from "@vertix.gg/dashboard/src/features/generators/types";

interface GeneratorsState {
    generators: DynamicMasterChannelInfo[];
    isLoading: boolean;
    /** The guild the list belongs to, so switching servers does not show the last one's. */
    loadedGuildId: string | null;
    load: ( guildId: string, force?: boolean ) => Promise<void>;
}

/**
 * The generators the editor can arrange, held once for the screen.
 *
 * Three parts of the editor need them - the picker that chooses one, the panel that arranges its
 * buttons, and the preview that draws them - and each keeping its own copy meant three fetches and,
 * worse, three answers: saving refreshed none of them, so the panel fell back to the settings it
 * had loaded at mount and appeared to undo the save it had just made.
 */
const useGeneratorsStore = create<GeneratorsState>( ( set, get ) => ( {
    generators: [],
    isLoading: false,
    loadedGuildId: null,

    load: async( guildId, force = false ) => {
        const { isLoading, loadedGuildId } = get();

        if ( isLoading || ( ! force && loadedGuildId === guildId ) ) {
            return;
        }

        set( { isLoading: true } );

        try {
            // The one call carries each generator's settings as well as its name, which is
            // everything the editor needs - so picking one costs no second trip.
            const response = await apiClient.get<GuildGeneratorsDetails>( `/management/guild/${ guildId }` );

            set( {
                generators: response.data?.dynamicMasterChannels ?? [],
                loadedGuildId: guildId
            } );
        } catch {
            set( { generators: [], loadedGuildId: guildId } );
        } finally {
            set( { isLoading: false } );
        }
    }
} ) );

/**
 * Function useEditorGenerator() :: Which generator the editor is arranging.
 *
 * The wording and artwork an editor changes belong to the whole server, but the set of buttons a
 * channel carries - and the rows they sit in - belong to one generator. So the editor has to know
 * which generator it is looking at before it can arrange anything, and a flow opened without one
 * is being read rather than edited.
 *
 * Held in the query string rather than in a store, so the screen can be linked to from the
 * generator it belongs with and returned to by going back.
 */
export function useEditorGenerator() {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const guildId = useSelectedGuildId();

    const generators = useGeneratorsStore( ( state ) => state.generators );
    const isLoading = useGeneratorsStore( ( state ) => state.isLoading );
    const load = useGeneratorsStore( ( state ) => state.load );

    const generatorId = searchParams.get( "generator" );

    useEffect( () => {
        if ( guildId ) {
            void load( guildId );
        }
    }, [ guildId, load ] );

    /** Re-read after a save, so what was written is what is drawn. */
    const refresh = useCallback( async() => {
        if ( guildId ) {
            await load( guildId, true );
        }
    }, [ guildId, load ] );

    const select = useCallback( ( id: string | null ) => {
        setSearchParams( ( current ) => {
            const next = new URLSearchParams( current );

            if ( id ) {
                next.set( "generator", id );
            } else {
                next.delete( "generator" );
            }

            return next;
        }, { replace: true } );
    }, [ setSearchParams ] );

    const selected = generators.find( ( generator ) => generator.id === generatorId ) ?? null;

    return { generators, generatorId, selected, isLoading, select, refresh };
}
