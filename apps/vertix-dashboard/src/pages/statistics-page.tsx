import { Navigate } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { GrowthSection } from "@vertix.gg/dashboard/src/features/statistics/components/growth-section";
import { ActivationSection } from "@vertix.gg/dashboard/src/features/statistics/components/activation-section";
import { UsageSection } from "@vertix.gg/dashboard/src/features/statistics/components/usage-section";
import { RevenueSection } from "@vertix.gg/dashboard/src/features/statistics/components/revenue-section";
import { AdoptionSection } from "@vertix.gg/dashboard/src/features/statistics/components/adoption-section";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

interface StatisticsPageSelectedState {
    isOwner: AuthState[ "isOwner" ];
}

/**
 * The owner's figures across every server - installs, how they went, usage, plans and features.
 *
 * Not about the server picked in the sidebar, so it reads the same whichever one that is. The api refuses
 * every read here to anybody but the owner; the page sends them home rather than drawing five refusals.
 */
export function StatisticsPage() {
    const [ authState ] = useCommandState<AuthState, StatisticsPageSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): StatisticsPageSelectedState => ( {
            isOwner: state.isOwner
        } )
    );

    if ( ! authState.isOwner ) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex-1 p-6 overflow-auto">
            <GrowthSection />
            <ActivationSection />
            <UsageSection />
            <RevenueSection />
            <AdoptionSection />
        </div>
    );
}

export default StatisticsPage;
