import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { EventsQuery } from "@vertix.gg/dashboard/src/features/events/query/events-query";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands/base";
import type {
    GuildEventRunDetail,
    GuildEventRunsPage
} from "@vertix.gg/dashboard/src/features/events/types";

/**
 * Command `Dashboard/Events/LoadMoreRuns` :: Adds the next page of the history below the last.
 */
export class LoadMoreRunsCommand extends CommandBase<EventsState> {
    public static getName(): string {
        return "Dashboard/Events/LoadMoreRuns";
    }

    public async apply() {
        const { guildId, nextCursor, isLoadingRuns, runs } = this.state;

        if ( ! guildId || ! nextCursor || isLoadingRuns ) {
            return;
        }

        this.setState( { isLoadingRuns: true } );

        const page = await getQueryModule( EventsQuery ).request<GuildEventRunsPage | null>( "Dashboard/Events/Runs", {
            guildId,
            cursor: nextCursor
        } ).catch( () => null );

        if ( ! page ) {
            return this.setState( { isLoadingRuns: false, error: "Could not load more of the history." } );
        }

        return this.setState( {
            runs: [ ... runs, ... page.runs ],
            nextCursor: page.nextCursor,
            isLoadingRuns: false
        } );
    }
}

/**
 * Command `Dashboard/Events/OpenRun` :: Opens one run's attendance.
 *
 * A command sees the state as it was when it started, so it cannot tell whether another run was
 * opened while this one loaded - the panel draws a run only under its own id instead.
 */
export class OpenRunCommand extends CommandBase<EventsState, { runId: string }> {
    public static getName(): string {
        return "Dashboard/Events/OpenRun";
    }

    public async apply( args: { runId: string } ) {
        const { guildId } = this.state;

        if ( ! guildId ) {
            return;
        }

        this.setState( { openRunId: args.runId, openRun: null, isLoadingRun: true, runFailed: false } );

        const run = await getQueryModule( EventsQuery ).request<GuildEventRunDetail | null>( "Dashboard/Events/Run", {
            guildId,
            runId: args.runId
        } ).catch( () => null );

        return this.setState( { openRun: run, isLoadingRun: false, runFailed: ! run } );
    }
}

export class CloseRunCommand extends CommandBase<EventsState> {
    public static getName(): string {
        return "Dashboard/Events/CloseRun";
    }

    public apply() {
        return this.setState( { openRunId: null, openRun: null, isLoadingRun: false, runFailed: false } );
    }
}

export class ClearErrorCommand extends CommandBase<EventsState> {
    public static getName(): string {
        return "Dashboard/Events/ClearError";
    }

    public apply() {
        return this.setState( { error: null, reasons: [] } );
    }
}
