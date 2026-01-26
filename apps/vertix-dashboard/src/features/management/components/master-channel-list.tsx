import { useState, useMemo } from "react";

import { Search, X, Layers, Radio } from "lucide-react";

import type {
    ScalingMasterChannelInfo,
    DynamicMasterChannelInfo,
    MasterChannelType
} from "@vertix.gg/dashboard/src/features/management/types";

interface MasterChannelListProps {
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
    }>;
}

export function MasterChannelList( { scalingMasters, dynamicMasters, selectedId, onSelect }: MasterChannelListProps ) {
    const [ searchTerm, setSearchTerm ] = useState( "" );

    const channelGroups = useMemo<ChannelGroup[]>( () => {
        return [
            {
                label: "Auto-Scaling",
                type: "scaling" as MasterChannelType,
                color: "#10b981",
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
                color: "#6366f1",
                icon: Radio,
                items: dynamicMasters.map( ( m ) => ( {
                    id: m.id,
                    channelId: m.channelId,
                    childCount: m.dynamicChannelsCount
                } ) )
            }
        ].filter( ( group ) => group.items.length > 0 );
    }, [ scalingMasters, dynamicMasters ] );

    const filteredGroups = useMemo( () => {
        if ( !searchTerm.trim() ) {
            return channelGroups;
        }

        const lowerSearch = searchTerm.toLowerCase();

        return channelGroups
            .map( ( group ) => ( {
                ...group,
                items: group.items.filter( ( item ) =>
                    item.channelId.toLowerCase().includes( lowerSearch ) ||
                    item.id.toLowerCase().includes( lowerSearch )
                )
            } ) )
            .filter( ( group ) => group.items.length > 0 );
    }, [ channelGroups, searchTerm ] );

    const totalChannels = scalingMasters.length + dynamicMasters.length;

    if ( totalChannels === 0 ) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-4">
                <Layers className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm text-center">No master channels found</p>
                <p className="text-xs text-center mt-1">Set up auto-scaling or dynamic channels in Discord</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-zinc-700">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search channels..."
                        value={ searchTerm }
                        onChange={ ( e ) => setSearchTerm( e.target.value ) }
                        className="w-full pl-8 pr-8 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                    { searchTerm && (
                        <button
                            onClick={ () => setSearchTerm( "" ) }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) }
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                { filteredGroups.length === 0 && searchTerm && (
                    <div className="text-zinc-500 text-sm text-center py-4">
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
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-300 hover:bg-zinc-700/50"
                                    }` }
                                    onClick={ () => onSelect( item.id, group.type ) }
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate" title={ item.channelId }>
                                            { item.channelId }
                                        </span>
                                        <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">
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
}
