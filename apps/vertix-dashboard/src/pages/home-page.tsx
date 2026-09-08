import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";
import { Navigate } from "react-router-dom";

import { Server, Users, Radio, Layers, Activity, Hash, Gauge } from "lucide-react";

import { GlobalStatsQuery } from "@vertix.gg/dashboard/src/features/home/query/global-stats-query";
import { GuildStatsQuery } from "@vertix.gg/dashboard/src/features/home/query/guild-stats-query";
import { GuildDetailsQuery } from "@vertix.gg/dashboard/src/features/home/query/guild-details-query";
import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { GuildHeader } from "@vertix.gg/dashboard/src/features/home/components/guild-header";
import { GeneratorsPanel } from "@vertix.gg/dashboard/src/features/home/components/generators-panel";
import { QuickActions } from "@vertix.gg/dashboard/src/features/home/components/quick-actions";
import { formatCount, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";
import type { GlobalStats, GuildStats, GuildDetails } from "@vertix.gg/dashboard/src/features/home/types";

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

function PanelSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-surface-elevated rounded w-1/3 mb-3" />
            <div className="h-1.5 bg-surface-elevated rounded w-full mb-3" />
            <div className="h-3 bg-surface-elevated rounded w-2/3" />
        </div>
    );
}

function SectionTitle( { title, hint }: { title: string; hint?: string } ) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-secondary mb-0">{ title }</h2>
            { hint && <span className="text-xs text-text-muted">{ hint }</span> }
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
        "Home/GlobalStats",
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

    const stats = state.globalStats;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
                title="Total Guilds"
                value={ formatCount( stats.totalGuilds ) }
                icon={ Server }
                description="Servers that have Vertix set up"
            />
            <StatCard
                title="Active Guilds"
                value={ formatCount( stats.activeGuilds ) }
                icon={ Activity }
                description={ `${ formatShare( stats.activeGuilds, stats.totalGuilds ) }% of all servers` }
            />
            <StatCard
                title="Total Users"
                value={ formatCount( stats.totalUsers ) }
                icon={ Users }
                description="People who have owned a channel"
            />
            <StatCard
                title="Total Channels"
                value={ formatCount( stats.totalChannels ) }
                icon={ Hash }
                description="Every channel Vertix keeps track of"
            />
            <StatCard
                title="Master Channels"
                value={ formatCount( stats.totalMasterChannels ) }
                icon={ Radio }
                description="Generators across every server"
            />
            <StatCard
                title="Dynamic Channels"
                value={ formatCount( stats.totalDynamicChannels ) }
                icon={ Layers }
                description="Live across the network right now"
            />
        </div>
    );
};

const GlobalStatsDisplay = withCommands<GlobalStatsDisplayProps, GlobalStatsDisplayState>(
    "Home/GlobalStats",
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
        "Home/GuildStats",
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

    const stats = state.guildStats;

    // How many channels a generator carries on average - the number that says whether the server
    // needs a second generator or is fine with the one it has.
    const perGenerator = stats.masterChannels > 0
        ? ( stats.dynamicChannels / stats.masterChannels ).toFixed( 1 )
        : "0";

    return (
        <>
            <GuildHeader stats={ stats } />

            <section className="mb-8">
                <SectionTitle title="This server" hint="Live figures, straight from the bot" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Live Channels"
                        value={ formatCount( stats.dynamicChannels ) }
                        icon={ Layers }
                        description="Channels members are in right now"
                    />
                    <StatCard
                        title="Generators"
                        value={ formatCount( stats.masterChannels ) }
                        icon={ Radio }
                        description="Channels that spawn the rest"
                    />
                    <StatCard
                        title="Per Generator"
                        value={ perGenerator }
                        icon={ Gauge }
                        description="Live channels each one carries"
                    />
                    <StatCard
                        title="Tracked Channels"
                        value={ formatCount( stats.totalChannels ) }
                        icon={ Hash }
                        description="Everything VoiceChannels owns here"
                    />
                </div>
            </section>
        </>
    );
};

const GuildStatsDisplay = withCommands<GuildStatsDisplayProps, GuildStatsDisplayState>(
    "Home/GuildStats",
    GuildStatsDisplayComponent,
    GUILD_STATS_INITIAL_STATE,
    []
);

interface GuildDetailsDisplayProps {
    guildId: string;
}

interface GuildDetailsDisplayState {
    guildDetails: GuildDetails | null;
}

interface GuildDetailsSelectedState {
    guildDetails: GuildDetailsDisplayState[ "guildDetails" ];
}

const GUILD_DETAILS_INITIAL_STATE: GuildDetailsDisplayState = {
    guildDetails: null
};

const GuildDetailsDisplayComponent: DCommandFunctionComponent<GuildDetailsDisplayProps, GuildDetailsDisplayState> = () => {
    const [ state ] = useCommandState<GuildDetailsDisplayState, GuildDetailsSelectedState>(
        "Home/GuildDetails",
        ( state: GuildDetailsDisplayState ): GuildDetailsSelectedState => ( {
            guildDetails: state.guildDetails
        } )
    );

    if ( !state.guildDetails ) {
        return (
            <div className="text-text-muted text-center py-8">
                Failed to load this server's generators
            </div>
        );
    }

    return <GeneratorsPanel masterChannels={ state.guildDetails.masterChannels } />;
};

const GuildDetailsDisplay = withCommands<GuildDetailsDisplayProps, GuildDetailsDisplayState>(
    "Home/GuildDetails",
    GuildDetailsDisplayComponent,
    GUILD_DETAILS_INITIAL_STATE,
    []
);

interface GuildSectionProps {
    selectedGuild: SelectedGuild | null;
}

function GuildStatsSection( { selectedGuild }: GuildSectionProps ) {
    if ( !selectedGuild ) {
        return (
            <div className="text-text-muted text-center py-8">
                No guild selected
            </div>
        );
    }

    return (
        <QueryComponent<GuildStats, GuildStatsDisplayProps, GuildStats, GuildStatsDisplayState>
            fallback={ <LoadingSkeleton count={ 4 } /> }
            module={ GuildStatsQuery }
            component={ GuildStatsDisplay }
            props={ { guildId: selectedGuild.id } }
        />
    );
}

function GeneratorsSection( { selectedGuild }: GuildSectionProps ) {
    if ( !selectedGuild ) {
        return null;
    }

    return (
        <QueryComponent<GuildDetails, GuildDetailsDisplayProps, GuildDetails, GuildDetailsDisplayState>
            fallback={ <PanelSkeleton /> }
            module={ GuildDetailsQuery }
            component={ GuildDetailsDisplay }
            props={ { guildId: selectedGuild.id } }
        />
    );
}

export function HomePage() {
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
            <GuildStatsSection selectedGuild={ authState.selectedGuild } />

            <section className="mb-8">
                <SectionTitle title="Generators" hint="Busiest first" />
                <GeneratorsSection selectedGuild={ authState.selectedGuild } />
            </section>

            <section className="mb-8">
                <SectionTitle title="Where to go next" />
                <QuickActions />
            </section>

            <section>
                <SectionTitle title="Across every server" hint="How the bot is doing overall" />
                <GlobalStatsSection />
            </section>
        </div>
    );
}
