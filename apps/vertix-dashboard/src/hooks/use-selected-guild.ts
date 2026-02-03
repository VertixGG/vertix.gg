import { create } from "zustand";

import type { SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";

interface SelectedGuildState {
    selectedGuild: SelectedGuild | null;
    setSelectedGuild: ( guild: SelectedGuild | null ) => void;
}

export const useSelectedGuildStore = create<SelectedGuildState>( ( set ) => ( {
    selectedGuild: null,
    setSelectedGuild: ( guild ) => set( { selectedGuild: guild } ),
} ) );

/**
 * Hook to access the currently selected guild.
 * This is synchronized with the auth state.
 */
export function useSelectedGuild() {
    const selectedGuild = useSelectedGuildStore( ( state ) => state.selectedGuild );
    return selectedGuild;
}

/**
 * Hook to get just the guild ID.
 */
export function useSelectedGuildId() {
    const selectedGuild = useSelectedGuildStore( ( state ) => state.selectedGuild );
    return selectedGuild?.id ?? null;
}
