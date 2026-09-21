import { Outlet } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { Sidebar } from "@vertix.gg/dashboard/src/components/sidebar";
import { LegalLinks } from "@vertix.gg/dashboard/src/components/legal-links";
import { BotPresenceGate } from "@vertix.gg/dashboard/src/features/bot-presence/components/bot-presence-gate";
import { TourGate } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-gate";
import { DYNAMIC_CHANNEL_COLOR_TOUR } from "@vertix.gg/dashboard/src/features/onboarding/tours/dynamic-channel-color-tour";

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

                <LegalLinks className="py-2 border-t border-border shrink-0" />
            </main>

            { /* Before the presence gate rather than after it: both draw at the same height, so
                 the later one wins, and a server the bot is not in should be answered before
                 anybody is offered a walk around a dashboard that cannot act on it. */ }
            <TourGate tour={ DYNAMIC_CHANNEL_COLOR_TOUR } />

            <BotPresenceGate selectedGuild={ authState.selectedGuild } />
        </div>
    );
}
