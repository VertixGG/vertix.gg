import { create } from "zustand";

import type { GuildBotPresence } from "@vertix.gg/dashboard/src/features/bot-presence/types";

interface BotPresenceState {
    presence: GuildBotPresence | null;
    setPresence: ( presence: GuildBotPresence | null ) => void;
}

/**
 * Where the answer to "is the bot in this server" is left for the rest of the app to read.
 *
 * The query that asks it runs inside its own commander component, and what acts on the answer - a
 * modal that has to reach the auth commands - only resolves those one level further out. Commander
 * state is scoped to the nearest component, so the answer travels between the two here, the same
 * way the selected guild does.
 */
export const useBotPresenceStore = create<BotPresenceState>( ( set ) => ( {
    presence: null,
    setPresence: ( presence ) => set( { presence } ),
} ) );
