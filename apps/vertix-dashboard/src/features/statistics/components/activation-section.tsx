import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { ActivationStatsQuery } from "@vertix.gg/dashboard/src/features/statistics/query/activation-stats-query";
import { ActivationFunnel } from "@vertix.gg/dashboard/src/features/statistics/components/activation-funnel";
import { InstallsTable } from "@vertix.gg/dashboard/src/features/statistics/components/installs-table";
import { RetentionTable } from "@vertix.gg/dashboard/src/features/statistics/components/retention-table";
import {
    StatisticsFailure,
    StatisticsSection,
    StatisticsSkeleton
} from "@vertix.gg/dashboard/src/features/statistics/components/statistics-section";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IActivationStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { ActivationDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

interface ActivationDisplayProps {}

const ACTIVATION_INITIAL_STATE: ActivationDisplayState = {
    activationStats: null
};

const ActivationDisplayComponent: DCommandFunctionComponent<ActivationDisplayProps, ActivationDisplayState> = () => {
    const [ state ] = useCommandState<ActivationDisplayState, ActivationDisplayState>(
        "Statistics/ActivationStats",
        ( state: ActivationDisplayState ): ActivationDisplayState => ( { activationStats: state.activationStats } )
    );

    if ( ! state.activationStats ) {
        return (
            <StatisticsSection title="Activation">
                <StatisticsFailure text="Failed to load the activation figures" />
            </StatisticsSection>
        );
    }

    return (
        <>
            <StatisticsSection title="Activation" hint="Where the installs got to, and how fast">
                <ActivationFunnel />
            </StatisticsSection>

            <StatisticsSection title="Retention" hint="Each week's installs, and the share still making rooms in each week after">
                <RetentionTable />
            </StatisticsSection>

            <StatisticsSection title="Installs" hint="Every install in the window, newest first">
                <InstallsTable />
            </StatisticsSection>
        </>
    );
};

const ActivationDisplay = withCommands<ActivationDisplayProps, ActivationDisplayState>(
    "Statistics/ActivationStats",
    ActivationDisplayComponent,
    ACTIVATION_INITIAL_STATE,
    []
);

/**
 * Where every install got to, how fast, and how long it kept going - three parts of the page off one read.
 */
export function ActivationSection() {
    return (
        <QueryComponent<IActivationStats, ActivationDisplayProps, IActivationStats, ActivationDisplayState>
            fallback={ <StatisticsSkeleton /> }
            module={ ActivationStatsQuery }
            component={ ActivationDisplay }
            props={ {} }
        />
    );
}

export default ActivationSection;
