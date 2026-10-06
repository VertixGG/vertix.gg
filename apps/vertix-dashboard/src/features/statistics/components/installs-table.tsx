import { useCommandState } from "@zenflux/react-commander/hooks";

import { PlanBadge } from "@vertix.gg/dashboard/src/features/statistics/components/plan-badge";
import { formatCount, formatDate } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatDuration } from "@vertix.gg/dashboard/src/features/statistics/lib/format";

import type { IGrowthInstall } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { ActivationDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

/**
 * Function describeAfter() :: How long after the install a milestone came - or "Before" for one from an
 * earlier install of the same server, which is never moved.
 */
function describeAfter( at: string | null, installedAt: string ): string {
    if ( ! at ) {
        return "-";
    }

    const afterMs = new Date( at ).getTime() - new Date( installedAt ).getTime();

    return afterMs < 0 ? "Before" : formatDuration( afterMs );
}

function describeJudged( isAliveAtJudgedDay: boolean | null ): string {
    if ( null === isAliveAtJudgedDay ) {
        return "-";
    }

    return isAliveAtJudgedDay ? "Alive" : "No";
}

function InstallStatus( { install }: { install: IGrowthInstall } ) {
    if ( ! install.isInGuild ) {
        const leftOn = formatDate( install.leftAt );

        return <span className="text-warning">{ leftOn ? `Removed ${ leftOn }` : "Removed" }</span>;
    }

    if ( install.roomsRecently > 0 ) {
        return <span className="text-success">Active</span>;
    }

    return <span className="text-text-muted">Quiet</span>;
}

/**
 * Every install in the window, newest first - what `scripts/report-activation.ts` lists, with what each
 * server holds now.
 */
export function InstallsTable() {
    const [ state ] = useCommandState<ActivationDisplayState, ActivationDisplayState>(
        "Statistics/ActivationStats",
        ( state: ActivationDisplayState ): ActivationDisplayState => ( { activationStats: state.activationStats } )
    );

    const activation = state.activationStats;

    if ( ! activation ) {
        return null;
    }

    if ( ! activation.installs.length ) {
        return <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-muted">No installs in the window yet.</div>;
    }

    return (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-text-muted">
                        <th className="px-4 py-2 font-medium">Server</th>
                        <th className="px-4 py-2 font-medium">Installed</th>
                        <th className="px-4 py-2 font-medium">Source</th>
                        <th className="px-4 py-2 font-medium">Set up after</th>
                        <th className="px-4 py-2 font-medium">First room after</th>
                        <th className="px-4 py-2 font-medium">Rooms this week</th>
                        <th className="px-4 py-2 font-medium">Day { activation.judgedDay }</th>
                        <th className="px-4 py-2 font-medium">Plan</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    { activation.installs.map( ( install ) => (
                        <tr key={ `${ install.guildId }-${ install.installedAt }` } className="border-t border-border-muted">
                            <td className="px-4 py-2 text-text-primary max-w-56 truncate" title={ `${ install.name } (${ install.guildId })` }>
                                { install.name }
                            </td>
                            <td className="px-4 py-2 text-text-secondary whitespace-nowrap">{ formatDate( install.installedAt ) }</td>
                            <td className="px-4 py-2 text-text-secondary">{ install.source }</td>
                            <td className="px-4 py-2 text-text-secondary tabular-nums">{ describeAfter( install.setupAt, install.installedAt ) }</td>
                            <td className="px-4 py-2 text-text-secondary tabular-nums">{ describeAfter( install.firstRoomAt, install.installedAt ) }</td>
                            <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatCount( install.roomsRecently ) }</td>
                            <td className="px-4 py-2 text-text-secondary">{ describeJudged( install.isAliveAtJudgedDay ) }</td>
                            <td className="px-4 py-2"><PlanBadge plan={ install.plan } /></td>
                            <td className="px-4 py-2 whitespace-nowrap"><InstallStatus install={ install } /></td>
                        </tr>
                    ) ) }
                </tbody>
            </table>
        </div>
    );
}

export default InstallsTable;
