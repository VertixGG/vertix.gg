import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { AdoptionStatsQuery } from "@vertix.gg/dashboard/src/features/statistics/query/adoption-stats-query";
import { ShareBars } from "@vertix.gg/dashboard/src/features/statistics/components/share-bars";
import {
    StatisticsFailure,
    StatisticsSection,
    StatisticsSkeleton
} from "@vertix.gg/dashboard/src/features/statistics/components/statistics-section";
import { formatCount } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatCountOf } from "@vertix.gg/dashboard/src/features/statistics/lib/format";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IAdoptionStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { AdoptionDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

interface AdoptionDisplayProps {}

const ADOPTION_INITIAL_STATE: AdoptionDisplayState = {
    adoptionStats: null
};

const ADOPTION_HINT = "Of the servers the bot is in now";

const AdoptionDisplayComponent: DCommandFunctionComponent<AdoptionDisplayProps, AdoptionDisplayState> = () => {
    const [ state ] = useCommandState<AdoptionDisplayState, AdoptionDisplayState>(
        "Statistics/AdoptionStats",
        ( state: AdoptionDisplayState ): AdoptionDisplayState => ( { adoptionStats: state.adoptionStats } )
    );

    const adoption = state.adoptionStats;

    if ( ! adoption ) {
        return (
            <StatisticsSection title="Features" hint={ ADOPTION_HINT }>
                <StatisticsFailure text="Failed to load the features in use" />
            </StatisticsSection>
        );
    }

    const { installed, generators } = adoption;

    return (
        <StatisticsSection title="Features" hint={ ADOPTION_HINT }>
            <ShareBars bars={ [
                { label: "Set up", count: adoption.setUp, total: installed, detail: "a generator of either kind" },
                { label: "V3 generators", count: adoption.dynamicV3, total: installed, detail: formatCountOf( generators.dynamicV3, "generator" ) },
                { label: "V2 generators", count: adoption.dynamicV2, total: installed, detail: formatCountOf( generators.dynamicV2, "generator" ) },
                { label: "Pools", count: adoption.pools, total: installed, detail: formatCountOf( generators.pools, "pool" ) },
                { label: "Events", count: adoption.events, total: installed, detail: "check-in switched on" },
                { label: "Branding", count: adoption.branding, total: installed, detail: "a profile saved" },
                { label: "Interface edits", count: adoption.interfaceEdits, total: installed, detail: "anything changed in the editor" }
            ] } />

            <p className="text-xs text-text-muted mt-3 mb-0">
                Of the { formatCount( installed ) } servers the bot is in. A server running more than one kind counts under each.
            </p>
        </StatisticsSection>
    );
};

const AdoptionDisplay = withCommands<AdoptionDisplayProps, AdoptionDisplayState>(
    "Statistics/AdoptionStats",
    AdoptionDisplayComponent,
    ADOPTION_INITIAL_STATE,
    []
);

/**
 * Which features the servers the bot is in use.
 */
export function AdoptionSection() {
    return (
        <QueryComponent<IAdoptionStats, AdoptionDisplayProps, IAdoptionStats, AdoptionDisplayState>
            fallback={ <StatisticsSkeleton /> }
            module={ AdoptionStatsQuery }
            component={ AdoptionDisplay }
            props={ {} }
        />
    );
}

export default AdoptionSection;
