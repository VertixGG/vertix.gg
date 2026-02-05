import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";
import { Navigate } from "react-router-dom";

import { Server, Users, Radio, Layers, Activity, Hash } from "lucide-react";

import { GlobalStatsQuery } from "@vertix.gg/dashboard/src/features/dashboard/query/global-stats-query";
import { GuildStatsQuery } from "@vertix.gg/dashboard/src/features/dashboard/query/guild-stats-query";
import { StatCard } from "@vertix.gg/dashboard/src/features/dashboard/components/stat-card";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";
import type { GlobalStats, GuildStats } from "@vertix.gg/dashboard/src/features/dashboard/types";

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

function LoadingSkeleton( { count }: { count: number } ) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            { [ ...Array( count ) ].map( ( _, i ) => (
                <div key={ i } className="bg-surface border border-border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-surface-elevated rounded w-1/2 mb-2" />
                    <div className="h-8 bg-surface-elevated rounded w-1/3" />
                </div>
            ) ) }
        </div>
    );
}

interface GlobalStatsDisplayProps {}

interface GlobalStatsDisplayState {
    globalStats: GlobalStats | null;
}

interface GlobalStatsSelectedState {
    globalStats: GlobalStatsDisplayState[ "globalStats" ];
}

const GLOBAL_STATS_INITIAL_STATE: GlobalStatsDisplayState = {
    globalStats: null
};

const GlobalStatsDisplayComponent: DCommandFunctionComponent<GlobalStatsDisplayProps, GlobalStatsDisplayState> = () => {
    const [ state ] = useCommandState<GlobalStatsDisplayState, GlobalStatsSelectedState>(
        "Dashboard/GlobalStats",
        ( state: GlobalStatsDisplayState ): GlobalStatsSelectedState => ( {
            globalStats: state.globalStats
        } )
    );

    if ( !state.globalStats ) {
        return (
            <div className="text-text-muted text-center py-8">
                Failed to load global stats
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Total Guilds" value={ state.globalStats.totalGuilds } icon={ Server } />
            <StatCard title="Active Guilds" value={ state.globalStats.activeGuilds } icon={ Activity } />
            <StatCard title="Total Users" value={ state.globalStats.totalUsers } icon={ Users } />
            <StatCard title="Total Channels" value={ state.globalStats.totalChannels } icon={ Hash } />
            <StatCard title="Master Channels" value={ state.globalStats.totalMasterChannels } icon={ Radio } />
            <StatCard title="Dynamic Channels" value={ state.globalStats.totalDynamicChannels } icon={ Layers } />
        </div>
    );
};

const GlobalStatsDisplay = withCommands<GlobalStatsDisplayProps, GlobalStatsDisplayState>(
    "Dashboard/GlobalStats",
    GlobalStatsDisplayComponent,
    GLOBAL_STATS_INITIAL_STATE,
    []
);

function GlobalStatsSection() {
    return (
        <QueryComponent<GlobalStats, GlobalStatsDisplayProps, GlobalStats, GlobalStatsDisplayState>
            fallback={ <LoadingSkeleton count={ 6 } /> }
            module={ GlobalStatsQuery }
            component={ GlobalStatsDisplay }
            props={ {} }
        />
    );
}

interface GuildStatsDisplayProps {
    guildId: string;
}

interface GuildStatsDisplayState {
    guildStats: GuildStats | null;
}

interface GuildStatsSelectedState {
    guildStats: GuildStatsDisplayState[ "guildStats" ];
}

const GUILD_STATS_INITIAL_STATE: GuildStatsDisplayState = {
    guildStats: null
};

const GuildStatsDisplayComponent: DCommandFunctionComponent<GuildStatsDisplayProps, GuildStatsDisplayState> = () => {
    const [ state ] = useCommandState<GuildStatsDisplayState, GuildStatsSelectedState>(
        "Dashboard/GuildStats",
        ( state: GuildStatsDisplayState ): GuildStatsSelectedState => ( {
            guildStats: state.guildStats
        } )
    );

    if ( !state.guildStats ) {
        return (
            <div className="text-text-muted text-center py-8">
                No data available for this guild yet
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Total Channels" value={ state.guildStats.totalChannels } icon={ Hash } />
            <StatCard title="Master Channels" value={ state.guildStats.masterChannels } icon={ Radio } />
            <StatCard title="Dynamic Channels" value={ state.guildStats.dynamicChannels } icon={ Layers } />
        </div>
    );
};

const GuildStatsDisplay = withCommands<GuildStatsDisplayProps, GuildStatsDisplayState>(
    "Dashboard/GuildStats",
    GuildStatsDisplayComponent,
    GUILD_STATS_INITIAL_STATE,
    []
);

interface GuildStatsSectionProps {
    selectedGuild: SelectedGuild | null;
}

function GuildStatsSection( { selectedGuild }: GuildStatsSectionProps ) {
    if ( !selectedGuild ) {
        return (
            <div className="text-text-muted text-center py-8">
                No guild selected
            </div>
        );
    }

    return (
        <QueryComponent<GuildStats, GuildStatsDisplayProps, GuildStats, GuildStatsDisplayState>
            fallback={ <LoadingSkeleton count={ 3 } /> }
            module={ GuildStatsQuery }
            component={ GuildStatsDisplay }
            props={ { guildId: selectedGuild.id } }
        />
    );
}

export function DashboardPage() {
    const [ authState ] = useCommandState<AuthState, AuthSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    if ( authState.selectedGuild?.id === "__default__" ) {
        return <Navigate to="/interface-editor" replace />;
    }

    return (
        <div className="flex-1 p-6 overflow-auto">
            <h1 className="text-2xl font-bold text-text-accent mb-6">Dashboard</h1>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-text-secondary mb-4">Guild Data</h2>
                <GuildStatsSection selectedGuild={ authState.selectedGuild } />
            </section>

            <section>
                <h2 className="text-lg font-semibold text-text-secondary mb-4">Global Data</h2>
                <GlobalStatsSection />
            </section>
        </div>
    );
}
