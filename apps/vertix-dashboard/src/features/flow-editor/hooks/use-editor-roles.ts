import { useEffect } from "react";
import { create } from "zustand";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";

import type { GuildDiscordOptions, GuildDiscordRole } from "@vertix.gg/dashboard/src/features/generators/types";

interface EditorRolesState {
    roles: GuildDiscordRole[];
    isLoading: boolean;
    /** The guild the list belongs to, so switching servers does not offer the last one's roles. */
    loadedGuildId: string | null;
    load: ( guildId: string ) => Promise<void>;
}

const useEditorRolesStore = create<EditorRolesState>( ( set, get ) => ( {
    roles: [],
    isLoading: false,
    loadedGuildId: null,

    load: async( guildId ) => {
        const { isLoading, loadedGuildId } = get();

        if ( isLoading || loadedGuildId === guildId ) {
            return;
        }

        set( { isLoading: true } );

        try {
            const response = await apiClient.get<GuildDiscordOptions>(
                `/management/guild/${ guildId }/discord-options`
            );

            set( {
                roles: Array.isArray( response.data?.roles ) ? response.data.roles : [],
                loadedGuildId: guildId
            } );
        } catch {
            set( { roles: [], loadedGuildId: guildId } );
        } finally {
            set( { isLoading: false } );
        }
    }
} ) );

/**
 * Function useEditorRoles() :: The roles a generator's buttons can be narrowed to.
 *
 * Answered highest role first, which is the order the bot resolves them in: a channel owner's
 * roles are walked from the top and the first one carrying a set wins. Listing them any other way
 * would put the role that actually decides somewhere in the middle.
 *
 * `@everyone` is left out rather than offered and refused. It carries the guild's own id, which
 * discord.js seeds into every member's role cache - so a set stored against it would match every
 * owner alive and make the default set unreachable. There is already a way to say "everyone",
 * and it is the default set itself.
 */
export function useEditorRoles() {
    const guildId = useSelectedGuildId();

    const roles = useEditorRolesStore( ( state ) => state.roles );
    const isLoading = useEditorRolesStore( ( state ) => state.isLoading );
    const load = useEditorRolesStore( ( state ) => state.load );

    useEffect( () => {
        if ( guildId ) {
            void load( guildId );
        }
    }, [ guildId, load ] );

    return {
        roles: roles.filter( ( role ) => role.id !== guildId ),
        isLoading
    };
}
