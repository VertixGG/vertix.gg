import { Outlet } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { Sidebar } from "@vertix.gg/dashboard/src/components/sidebar";
import { BotPresenceGate } from "@vertix.gg/dashboard/src/features/bot-presence/components/bot-presence-gate";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

interface AppLayoutSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

export function AppLayout() {
    const [ authState ] = useCommandState<AuthState, AppLayoutSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AppLayoutSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <Outlet />
            </main>

            <BotPresenceGate selectedGuild={ authState.selectedGuild } />
        </div>
    );
}
