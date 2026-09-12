import { useMemo } from "react";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState, useComponent } from "@zenflux/react-commander/hooks";

import { Search, X, Layers, Radio } from "lucide-react";

import { isV2Version } from "@vertix.gg/definitions/src/button-ids";

import {
    MASTER_CHANNEL_LIST_INITIAL_STATE,
    MASTER_CHANNEL_LIST_COMMANDS
} from "@vertix.gg/dashboard/src/features/generators/commands/master-channel-list/master-channel-list-commands";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { MasterChannelListState } from "@vertix.gg/dashboard/src/features/generators/commands/master-channel-list/master-channel-list-commands";
import type {
    ScalingMasterChannelInfo,
    DynamicMasterChannelInfo,
    MasterChannelType
} from "@vertix.gg/dashboard/src/features/generators/types";

export interface MasterChannelListProps {
    scalingMasters: ScalingMasterChannelInfo[];
    dynamicMasters: DynamicMasterChannelInfo[];
    selectedId: string | null;
    onSelect: ( id: string, type: MasterChannelType ) => void;
}

interface ChannelGroup {
    label: string;
    type: MasterChannelType;
    color: string;
    icon: typeof Layers;
    items: Array<{
        id: string;
        channelId: string;
        childCount: number;
        version?: string;
    }>;
}

const MasterChannelListComponent: DCommandFunctionComponent<MasterChannelListProps, MasterChannelListState> = ( {
    scalingMasters,
    dynamicMasters,
    selectedId,
    onSelect
} ) => {
    const [ state ] = useCommandState<MasterChannelListState, Pick<MasterChannelListState, "searchTerm">>(
        "Dashboard/Generators/MasterChannelList",
        ( state ) => ( {
            searchTerm: state.searchTerm
        } )
    );

    const listCommands = useComponent( "Dashboard/Generators/MasterChannelList" );

    const channelGroups = useMemo<ChannelGroup[]>( () => {
        return [
            {
                label: "Auto-Scaling",
                type: "scaling" as MasterChannelType,
                color: "var(--color-success)",
                icon: Layers,
                items: scalingMasters.map( ( m ) => ( {
                    id: m.id,
                    channelId: m.channelId,
                    childCount: m.scalingChannelsCount
                } ) )
            },
            {
                label: "Dynamic",
                type: "dynamic" as MasterChannelType,
                color: "var(--color-accent)",
                icon: Radio,
                items: dynamicMasters.map( ( m ) => ( {
                    id: m.id,
                    channelId: m.channelId,
                    childCount: m.dynamicChannelsCount,
                    version: m.version
                } ) )
            }
        ].filter( ( group ) => group.items.length > 0 );
    }, [ scalingMasters, dynamicMasters ] );

    const filteredGroups = useMemo( () => {
        if ( !state.searchTerm.trim() ) {
            return channelGroups;
        }

        const lowerSearch = state.searchTerm.toLowerCase();

        return channelGroups
            .map( ( group ) => ( {
                ...group,
                items: group.items.filter( ( item ) =>
                    item.channelId.toLowerCase().includes( lowerSearch ) ||
                    item.id.toLowerCase().includes( lowerSearch )
                )
            } ) )
            .filter( ( group ) => group.items.length > 0 );
    }, [ channelGroups, state.searchTerm ] );

    const totalChannels = scalingMasters.length + dynamicMasters.length;

    const handleSearchChange = ( value: string ) => {
        listCommands.run( "Dashboard/Generators/MasterChannelList/SetSearchTerm", { value } );
    };

    const handleClearSearch = () => {
        listCommands.run( "Dashboard/Generators/MasterChannelList/ClearSearchTerm", {} );
    };

    if ( totalChannels === 0 ) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-4">
                <Layers className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm text-center">No master channels found</p>
                <p className="text-xs text-center mt-1">Set up auto-scaling or dynamic channels in Discord</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search channels..."
                        value={ state.searchTerm }
                        onChange={ ( e ) => handleSearchChange( e.target.value ) }
                        className="w-full pl-8 pr-8 py-1.5 bg-background border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-accent"
                    />
                    { state.searchTerm && (
                        <button
                            onClick={ handleClearSearch }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) }
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                { filteredGroups.length === 0 && state.searchTerm && (
                    <div className="text-text-muted text-sm text-center py-4">
                        No matching channels
                    </div>
                ) }

                { filteredGroups.map( ( group ) => (
                    <div key={ group.label } className="mb-4">
                        <div
                            className="flex items-center gap-2 px-2 py-1 text-sm font-medium"
                            style={ { color: group.color } }
                        >
                            <group.icon className="w-4 h-4" />
                            { group.label } ({ group.items.length })
                        </div>

                        <div className="mt-1 space-y-0.5">
                            { group.items.map( ( item ) => (
                                <div
                                    key={ item.id }
                                    className={ `px-4 py-2 text-sm rounded cursor-pointer transition-colors ${
                                        selectedId === item.id
                                            ? "bg-surface-elevated text-text-primary"
                                            : "text-text-primary hover:bg-surface-elevated/50"
                                    }` }
                                    onClick={ () => onSelect( item.id, group.type ) }
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="truncate" title={ item.channelId }>
                                                { item.channelId }
                                            </span>
                                            { item.version && (
                                                <span className={ `text-[10px] px-1 py-0.5 rounded flex-shrink-0 ${
                                                    isV2Version( item.version )
                                                        ? "bg-surface-hover/50 text-text-secondary"
                                                        : "bg-accent/20 text-text-accent"
                                                }` }>
                                                    { isV2Version( item.version ) ? "V2" : "V3" }
                                                </span>
                                            ) }
                                        </div>
                                        <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                                            { item.childCount } { group.type === "scaling" ? "scaling" : "dynamic" }
                                        </span>
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
};

const MasterChannelList = withCommands(
    "Dashboard/Generators/MasterChannelList",
    MasterChannelListComponent,
    MASTER_CHANNEL_LIST_INITIAL_STATE,
    [ ...MASTER_CHANNEL_LIST_COMMANDS ]
);

export { MasterChannelList };
export default MasterChannelList;
