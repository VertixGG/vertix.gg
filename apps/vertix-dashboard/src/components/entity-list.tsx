import { useMemo, useState } from "react";

import { Search, X } from "lucide-react";

import { MINIMAP_COLORS } from "@vertix.gg/dashboard/src/lib/constants";

import type { ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";

export type EntityType = "flow" | "systemFlow" | "component" | "modal";

interface EntityGroup {
    label: string;
    type: EntityType;
    color: string;
    items: string[];
}

interface EntityListProps {
    moduleFlowsData: ModuleFlowsResponse | null;
    onEntitySelect?: ( entityType: EntityType, entityName: string ) => void;
}

export function EntityList( { moduleFlowsData, onEntitySelect }: EntityListProps ) {
    const [ searchTerm, setSearchTerm ] = useState( "" );

    const entityGroups = useMemo<EntityGroup[]>( () => {
        if ( !moduleFlowsData ) {
            return [];
        }

        const modals = new Set<string>();

        moduleFlowsData.components.forEach( ( component ) => {
            component.modals.forEach( ( modal ) => modals.add( modal ) );
        } );

        return [
            {
                label: "Flows",
                type: "flow" as EntityType,
                color: MINIMAP_COLORS.FLOW,
                items: moduleFlowsData.flows.map( ( f ) => f.name )
            },
            {
                label: "System Flows",
                type: "systemFlow" as EntityType,
                color: MINIMAP_COLORS.SYSTEM_FLOW,
                items: moduleFlowsData.systemFlows.map( ( f ) => f.name )
            },
            {
                label: "Components",
                type: "component" as EntityType,
                color: MINIMAP_COLORS.COMPONENT,
                items: moduleFlowsData.components.map( ( c ) => c.name )
            },
            {
                label: "Modals",
                type: "modal" as EntityType,
                color: MINIMAP_COLORS.MODAL,
                items: Array.from( modals )
            }
        ].filter( ( group ) => group.items.length > 0 );
    }, [ moduleFlowsData ] );

    const filteredGroups = useMemo( () => {
        if ( !searchTerm.trim() ) {
            return entityGroups;
        }

        const lowerSearch = searchTerm.toLowerCase();

        return entityGroups
            .map( ( group ) => ( {
                ...group,
                items: group.items.filter( ( item ) =>
                    item.toLowerCase().includes( lowerSearch )
                )
            } ) )
            .filter( ( group ) => group.items.length > 0 );
    }, [ entityGroups, searchTerm ] );

    if ( !moduleFlowsData ) {
        return null;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-zinc-700">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search entities..."
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
                        No matching entities
                    </div>
                ) }

                { filteredGroups.map( ( group ) => (
                    <div key={ group.label } className="mb-4">
                        <div
                            className="flex items-center gap-2 px-2 py-1 text-sm font-medium"
                            style={ { color: group.color } }
                        >
                            <span
                                className="w-3 h-3 rounded-full"
                                style={ { backgroundColor: group.color } }
                            />
                            { group.label } ({ group.items.length })
                        </div>

                        <div className="mt-1 space-y-0.5">
                            { group.items.map( ( item ) => (
                                <div
                                    key={ item }
                                    className="px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700/50 rounded cursor-pointer truncate"
                                    title={ item }
                                    onClick={ () => onEntitySelect?.( group.type, item ) }
                                >
                                    { item }
                                </div>
                            ) ) }
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
}
