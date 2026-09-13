import { useEffect, useRef, useState } from "react";

import { Navigate } from "react-router-dom";

import { useCommandState, useCommand } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";

import { Layers, Radio, Loader2, Plus, RefreshCw, ChevronDown, AlertTriangle } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import { Toast } from "@vertix.gg/dashboard/src/components/toast";

import {
    GENERATORS_COMMANDS,
    GENERATORS_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/generators/commands";

import MasterChannelList from "@vertix.gg/dashboard/src/features/generators/components/master-channel-list/master-channel-list";
import ScalingDetailsPanel from "@vertix.gg/dashboard/src/features/generators/components/scaling-details-panel/scaling-details-panel";
import DynamicDetailsPanel from "@vertix.gg/dashboard/src/features/generators/components/dynamic-details-panel/dynamic-details-panel";
import CreateScalingForm from "@vertix.gg/dashboard/src/features/generators/components/create-scaling-form/create-scaling-form";
import CreateDynamicForm from "@vertix.gg/dashboard/src/features/generators/components/create-dynamic-form/create-dynamic-form";

import type { GeneratorsState, CreateModalType } from "@vertix.gg/dashboard/src/features/generators/commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { MasterChannelType } from "@vertix.gg/dashboard/src/features/generators/types";

interface AuthSelectedState {
    selectedGuild: AuthState[ "selectedGuild" ];
}

interface GeneratorsSelectedState {
    generatorsDetails: GeneratorsState[ "generatorsDetails" ];
    discordOptions: GeneratorsState[ "discordOptions" ];
    selectedMasterChannelId: GeneratorsState[ "selectedMasterChannelId" ];
    selectedMasterChannelType: GeneratorsState[ "selectedMasterChannelType" ];
    isSaving: GeneratorsState[ "isSaving" ];
    isCreating: GeneratorsState[ "isCreating" ];
    isLoading: GeneratorsState[ "isLoading" ];
    isRefreshing: GeneratorsState[ "isRefreshing" ];
    error: GeneratorsState[ "error" ];
    lastRefreshTimestamp: GeneratorsState[ "lastRefreshTimestamp" ];
    showCreateModal: GeneratorsState[ "showCreateModal" ];
    createModalType: GeneratorsState[ "createModalType" ];
}

interface GeneratorsContentProps {
    guildId: string;
}

const GeneratorsContentComponent: DCommandFunctionComponent<GeneratorsContentProps, GeneratorsState> = ( { guildId } ) => {
    const [ state ] = useCommandState<GeneratorsState, GeneratorsSelectedState>(
        "Dashboard/Generators",
        ( state: GeneratorsState ): GeneratorsSelectedState => ( {
            generatorsDetails: state.generatorsDetails,
            discordOptions: state.discordOptions,
            selectedMasterChannelId: state.selectedMasterChannelId,
            selectedMasterChannelType: state.selectedMasterChannelType,
            isSaving: state.isSaving,
            isCreating: state.isCreating,
            isLoading: state.isLoading,
            isRefreshing: state.isRefreshing,
            error: state.error,
            lastRefreshTimestamp: state.lastRefreshTimestamp,
            showCreateModal: state.showCreateModal,
            createModalType: state.createModalType
        } )
    );

    // Derive selected master from generatorsDetails - single source of truth
    const selectedScalingMaster = state.selectedMasterChannelType === "scaling" && state.generatorsDetails
        ? state.generatorsDetails.scalingMasterChannels.find( ( m ) => m.id === state.selectedMasterChannelId )
        : null;

    const selectedDynamicMaster = state.selectedMasterChannelType === "dynamic" && state.generatorsDetails
        ? state.generatorsDetails.dynamicMasterChannels.find( ( m ) => m.id === state.selectedMasterChannelId )
        : null;

    const [ showCreateDropdown, setShowCreateDropdown ] = useState( false );

    const createMenuRef = useRef<HTMLDivElement>( null );

    const loadGuildGenerators = useCommand( "Dashboard/Generators/LoadGuildGenerators" );
    const selectMasterChannel = useCommand( "Dashboard/Generators/SelectMasterChannel" );
    const clearError = useCommand( "Dashboard/Generators/ClearError" );
    const showCreateModalCmd = useCommand( "Dashboard/Generators/ShowCreateModal" );

    useEffect( () => {
        loadGuildGenerators.run( { guildId } );
    }, [ guildId ] );

    // A menu that only closes by pressing its own button reads as stuck.
    useEffect( () => {
        if ( !showCreateDropdown ) {
            return;
        }

        const handlePointerDown = ( event: MouseEvent ) => {
            if ( createMenuRef.current && !createMenuRef.current.contains( event.target as Node ) ) {
                setShowCreateDropdown( false );
            }
        };

        document.addEventListener( "mousedown", handlePointerDown );

        return () => document.removeEventListener( "mousedown", handlePointerDown );
    }, [ showCreateDropdown ] );

    const handleSelectChannel = ( id: string, type: MasterChannelType ) => {
        selectMasterChannel.run( { masterChannelId: id, type } );
    };

    const handleShowCreateModal = ( type: CreateModalType ) => {
        setShowCreateDropdown( false );
        showCreateModalCmd.run( { type } );
    };

    const handleRefreshList = () => {
        loadGuildGenerators.run( { guildId } );
    };

    if ( state.isLoading && !state.generatorsDetails ) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
            </div>
        );
    }

    // Only an error that left nothing on screen takes the page; one that arrives with data still
    // in hand is a banner over it, so a failed save does not throw the list away.
    if ( state.error && !state.generatorsDetails ) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <AlertTriangle className="w-8 h-8 text-error mb-3" />
                <div className="text-error mb-2">{ state.error }</div>
                <button
                    onClick={ () => {
                        clearError.run( {} );
                        loadGuildGenerators.run( { guildId } );
                    } }
                    className="text-sm text-text-secondary hover:text-text-primary"
                >
                    Try again
                </button>
            </div>
        );
    }

    const { generatorsDetails, selectedMasterChannelId, selectedMasterChannelType } = state;

    if ( !generatorsDetails ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No generator data available
            </div>
        );
    }

    /*
     * How many setups this server may have, and how many it has.
     *
     * Both kinds count, against the one total. A generator and an auto-scaling pool are different
     * things to run, but each is one setup somebody made and one category standing in the server,
     * and the limit is on how many of those there are rather than on either kind in particular - so
     * the last one available can be spent on either, and once it is gone neither is offered.
     *
     * The number comes out of the bot's configuration, carried here by the api rather than written
     * down again, so moving it there moves it here.
     *
     * Anything that is not a number is not knowing: the bot did not answer and it arrived null, or
     * an api that predates it answered without the field at all and it is missing. Both leave the
     * count standing on its own and refuse nothing - there is no limit here to hold anybody to.
     */
    const limit = generatorsDetails.settings.maxMasterChannels,
        maxMasterChannels = "number" === typeof limit ? limit : null,
        dynamicMastersCount = generatorsDetails.dynamicMasterChannels.length,
        scalingMastersCount = generatorsDetails.scalingMasterChannels.length,
        masterChannelsCount = dynamicMastersCount + scalingMastersCount,
        hasReachedMasterLimit = null !== maxMasterChannels && masterChannelsCount >= maxMasterChannels;

    const masterLimitReason = hasReachedMasterLimit
        ? `This server already has ${ masterChannelsCount } of ${ maxMasterChannels } setups. ` +
            "Delete one before creating another."
        : undefined;

    const handleShowLimitedCreateModal = ( type: CreateModalType ) => {
        if ( hasReachedMasterLimit ) {
            return;
        }

        handleShowCreateModal( type );
    };

    if ( 0 === masterChannelsCount ) {
        return (
            <>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full">
                        <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">Generators</h1>
                        <p className="text-text-muted text-center mb-8">
                            Nothing is set up in this server yet. Pick the kind of setup you want, or run
                            <code className="text-text-secondary"> /setup </code>
                            in Discord.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            { /* Reachable here only on a server that was given a limit of none, since
                                 this state is the one with nothing set up at all. Guarded anyway -
                                 every entry point spends from the same total and should refuse for
                                 the same reason. */ }
                            <button
                                onClick={ () => handleShowLimitedCreateModal( "dynamic" ) }
                                disabled={ hasReachedMasterLimit }
                                title={ masterLimitReason }
                                className="text-left bg-surface border border-border hover:border-border-accent
                                    rounded-lg p-5 transition-colors disabled:opacity-50
                                    disabled:hover:border-border disabled:cursor-not-allowed"
                            >
                                <Radio className="w-6 h-6 text-success mb-3" />
                                <h2 className="text-text-primary font-semibold mb-1">Dynamic channels</h2>
                                <p className="text-sm text-text-muted mb-0">
                                    { masterLimitReason ?? "Members join one generator channel and get a channel " +
                                        "of their own, with a control panel to run it." }
                                </p>
                            </button>

                            <button
                                onClick={ () => handleShowLimitedCreateModal( "scaling" ) }
                                disabled={ hasReachedMasterLimit }
                                title={ masterLimitReason }
                                className="text-left bg-surface border border-border hover:border-border-accent
                                    rounded-lg p-5 transition-colors disabled:opacity-50
                                    disabled:hover:border-border disabled:cursor-not-allowed"
                            >
                                <Layers className="w-6 h-6 text-text-accent mb-3" />
                                <h2 className="text-text-primary font-semibold mb-1">Auto-scaling channels</h2>
                                <p className="text-sm text-text-muted mb-0">
                                    { masterLimitReason ?? "A pool of channels that grows and shrinks with " +
                                        "demand, so a busy server never runs out of room." }
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
                { state.showCreateModal && state.createModalType === "scaling" && (
                    <CreateScalingForm isCreating={ state.isCreating } />
                ) }
                { state.showCreateModal && state.createModalType === "dynamic" && (
                    <CreateDynamicForm isCreating={ state.isCreating } />
                ) }

                { /* The same corner as on the page with a list in it - a create can be refused from
                     either, and should be answered the same way from both. */ }
                { state.error && (
                    <Toast message={ state.error } onDismiss={ () => clearError.run( {} ) } />
                ) }
            </>
        );
    }

    return (
        <>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-1">Generators</h1>
                        { /* The total leads, since that is what the limit is on, with the two kinds
                             broken out behind it. An unread limit drops back to the plain total
                             rather than printing an "of" with nothing after it. */ }
                        <p className="text-sm text-text-muted mb-0">
                            { null === maxMasterChannels
                                ? `${ masterChannelsCount }`
                                : `${ masterChannelsCount } of ${ maxMasterChannels }` }
                            { 1 === ( maxMasterChannels ?? masterChannelsCount ) ? " setup" : " setups" }
                            { " · " }
                            { dynamicMastersCount } dynamic
                            { " · " }
                            { scalingMastersCount } auto-scaling
                        </p>
                    </div>

                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="w-80 border-r border-border flex flex-col bg-surface/50">
                        <MasterChannelList
                            scalingMasters={ generatorsDetails.scalingMasterChannels }
                            dynamicMasters={ generatorsDetails.dynamicMasterChannels }
                            selectedId={ selectedMasterChannelId }
                            onSelect={ handleSelectChannel }
                        />

                        { /* Below the list rather than in the header: both act on the list, and a
                             long one scrolls the header away from them. */ }
                        <div className="shrink-0 p-2 border-t border-border flex items-center gap-2">
                            <DiscordButton
                                onClick={ handleRefreshList }
                                disabled={ state.isLoading }
                                title="Refresh"
                                icon={ <RefreshCw className={ `w-4 h-4 ${ state.isLoading ? "animate-spin" : "" }` } /> }
                            >
                                Refresh
                            </DiscordButton>

                            <div className="relative flex-1" ref={ createMenuRef }>
                                <DiscordButton
                                    variant="primary"
                                    className="w-full"
                                    onClick={ () => setShowCreateDropdown( !showCreateDropdown ) }
                                    icon={ <Plus className="w-4 h-4" /> }
                                    trailingIcon={ <ChevronDown className="w-3 h-3" /> }
                                >
                                    New setup
                                </DiscordButton>

                                { showCreateDropdown && (
                                    // Opens upward, there is nothing below it to open into.
                                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface
                                        border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                                        { /* The count is on the menu rather than on either entry: it
                                             is one total spent from by both, and somebody about to
                                             spend the last of it wants to know before they do. */ }
                                        { null !== maxMasterChannels && (
                                            <div className="px-3 py-2 border-b border-border flex items-center
                                                justify-between text-xs text-text-muted">
                                                <span>Setups used</span>
                                                <span className="tabular-nums">
                                                    { masterChannelsCount } / { maxMasterChannels }
                                                </span>
                                            </div>
                                        ) }
                                        <button
                                            onClick={ () => handleShowLimitedCreateModal( "dynamic" ) }
                                            disabled={ hasReachedMasterLimit }
                                            title={ masterLimitReason }
                                            className="w-full px-3 py-2 text-left text-sm text-text-primary
                                                hover:bg-surface-elevated flex items-center gap-2
                                                disabled:opacity-50 disabled:hover:bg-transparent
                                                disabled:cursor-not-allowed"
                                        >
                                            <Radio className="w-4 h-4 text-success" />
                                            Dynamic Channel Setup
                                        </button>
                                        <button
                                            onClick={ () => handleShowLimitedCreateModal( "scaling" ) }
                                            disabled={ hasReachedMasterLimit }
                                            title={ masterLimitReason }
                                            className="w-full px-3 py-2 text-left text-sm text-text-primary
                                                hover:bg-surface-elevated flex items-center gap-2
                                                disabled:opacity-50 disabled:hover:bg-transparent
                                                disabled:cursor-not-allowed"
                                        >
                                            <Layers className="w-4 h-4 text-text-accent" />
                                            Auto-Scaling Setup
                                        </button>
                                    </div>
                                ) }
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-background">
                        { !selectedMasterChannelId ? (
                            <div className="flex-1 flex items-center justify-center text-text-muted">
                                <div className="text-center">
                                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Select a master channel to view details</p>
                                </div>
                            </div>
                        ) : state.isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
                            </div>
                        ) : selectedMasterChannelType === "scaling" && selectedScalingMaster?.scalingChannels ? (
                            <ScalingDetailsPanel
                                key={ selectedScalingMaster.id }
                                details={ {
                                    master: selectedScalingMaster,
                                    scalingChannels: selectedScalingMaster.scalingChannels,
                                    discord: selectedScalingMaster.discord
                                } }
                                isSaving={ state.isSaving }
                                isRefreshing={ state.isRefreshing }
                                lastRefreshTime={ state.lastRefreshTimestamp ? new Date( state.lastRefreshTimestamp ) : null }
                            />
                        ) : selectedMasterChannelType === "dynamic" && selectedDynamicMaster?.dynamicChannels ? (
                            <DynamicDetailsPanel
                                key={ selectedDynamicMaster.id }
                                discordOptions={ state.discordOptions }
                                guildSettings={ generatorsDetails.settings }
                                details={ {
                                    master: selectedDynamicMaster,
                                    dynamicChannels: selectedDynamicMaster.dynamicChannels,
                                    discord: selectedDynamicMaster.discord
                                } }
                                isSaving={ state.isSaving }
                                isRefreshing={ state.isRefreshing }
                                lastRefreshTime={ state.lastRefreshTimestamp ? new Date( state.lastRefreshTimestamp ) : null }
                            />
                        ) : null }
                    </div>
                </div>
            </div>
            { state.showCreateModal && state.createModalType === "scaling" && (
                <CreateScalingForm isCreating={ state.isCreating } />
            ) }
            { state.showCreateModal && state.createModalType === "dynamic" && (
                <CreateDynamicForm isCreating={ state.isCreating } />
            ) }

            { /* Last, so it is over everything including a form that is still up. The page it
                 belongs to is unchanged underneath - an error here is something that did not
                 happen, and nothing on screen should move to report it. */ }
            { state.error && (
                <Toast message={ state.error } onDismiss={ () => clearError.run( {} ) } />
            ) }
        </>
    );
};

const GeneratorsContent = withCommands<GeneratorsContentProps, GeneratorsState>(
    "Dashboard/Generators",
    GeneratorsContentComponent,
    GENERATORS_INITIAL_STATE,
    [ ...GENERATORS_COMMANDS ]
);

export function GeneratorsPage() {
    const [ authState ] = useCommandState<AuthState, AuthSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): AuthSelectedState => ( {
            selectedGuild: state.selectedGuild
        } )
    );

    if ( !authState.selectedGuild ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No guild selected
            </div>
        );
    }

    if ( authState.selectedGuild.id === DEFAULT_CUSTOMIZATION_GUILD_ID ) {
        return <Navigate to="/interface-editor" replace />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <GeneratorsContent guildId={ authState.selectedGuild.id } />
        </div>
    );
}
