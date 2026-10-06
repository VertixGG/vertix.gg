import { useCommandState } from "@zenflux/react-commander/hooks";

import { DoorClosed, Hourglass, Timer, Wrench } from "lucide-react";

import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { ShareBars } from "@vertix.gg/dashboard/src/features/statistics/components/share-bars";
import { formatCount, formatDay } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatDuration } from "@vertix.gg/dashboard/src/features/statistics/lib/format";

import type { ActivationDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

function formatMedian( durationMs: number | null ) {
    return null === durationMs ? "-" : formatDuration( durationMs );
}

/**
 * Where the installs in the window got to - each step as a share of them - and how long the getting
 * there took.
 */
export function ActivationFunnel() {
    const [ state ] = useCommandState<ActivationDisplayState, ActivationDisplayState>(
        "Statistics/ActivationStats",
        ( state: ActivationDisplayState ): ActivationDisplayState => ( { activationStats: state.activationStats } )
    );

    const activation = state.activationStats;

    if ( ! activation ) {
        return null;
    }

    const { funnel, timings, judgedDay } = activation,
        countingBeganInWindow = !! activation.countedSince && activation.countedSince > activation.since;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                    title="Time to Set Up"
                    value={ formatMedian( timings.medianToSetUpMs ) }
                    icon={ Wrench }
                    description="Median, from adding the bot to a first generator"
                />
                <StatCard
                    title="Time to First Room"
                    value={ formatMedian( timings.medianToFirstRoomMs ) }
                    icon={ Timer }
                    description="Median, from adding the bot to a member's first room"
                />
                <StatCard
                    title="Removed"
                    value={ formatCount( timings.removed ) }
                    icon={ DoorClosed }
                    description={ `${ formatCount( timings.removedWithoutSetUp ) } never set up · ${ formatCount( timings.removedWithinDay ) } within a day` }
                />
                <StatCard
                    title="Kept For"
                    value={ formatMedian( timings.medianLifetimeMs ) }
                    icon={ Hourglass }
                    description="Median, by the ones that removed it"
                />
            </div>

            <ShareBars bars={ [
                { label: "Set up", count: funnel.setUpEver, total: funnel.installs, detail: "made a generator" },
                { label: "Had a room", count: funnel.firstRoomEver, total: funnel.installs, detail: "a member made one" },
                { label: "Still installed", count: funnel.stillInstalled, total: funnel.installs },
                { label: "Active this week", count: funnel.activeRecently, total: funnel.installs, detail: "rooms in the last 7 days" },
                {
                    label: `Alive at day ${ judgedDay }`,
                    count: funnel.aliveAtJudgedDay,
                    total: funnel.judged,
                    detail: `of the ${ formatCount( funnel.judged ) } old enough`
                }
            ] } />

            <p className="text-xs text-text-muted mt-3 mb-0">
                Of { formatCount( funnel.installs ) } installs since { formatDay( activation.since ) }.
                { countingBeganInWindow && activation.countedSince && (
                    ` Setups and rooms are recorded from ${ formatDay( activation.countedSince ) } - an install before it may read as never set up.`
                ) }
            </p>
        </>
    );
}

export default ActivationFunnel;
