import { useMemo, useState } from "react";

import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { Search, X } from "lucide-react";

import { MINIMAP_COLORS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";
import { useTourAnchor } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-anchor";
import { entityListAnchor } from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-anchors";
import { computeReachableFlows } from "@vertix.gg/dashboard/src/features/flow-editor/lib/graph-builder";
import { isForeignTo } from "@vertix.gg/dashboard/src/features/flow-editor/lib/module-scope";
import { useExtraModulesStore } from "@vertix.gg/dashboard/src/hooks/use-extra-modules-store";
import { ExtraModulesToggle } from "@vertix.gg/dashboard/src/features/flow-editor/components/extra-modules-toggle";

import type { FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";

export type EntityType = "flow" | "systemFlow" | "component" | "modal";

interface EntityGroup {
    label: string;
    type: EntityType;
    color: string;
    items: string[];
}

interface EntityListItemProps {
    name: string;
    onSelect: () => void;
}

/**
 * Function EntityListItem() :: One row, which is also one thing on the screen able to say what it
 * is.
 *
 * A component of its own rather than markup inside the loop, because the row registers itself and
 * a hook cannot be drawn from inside a list whose length is whatever the search box left behind.
 */
function EntityListItem( { name, onSelect }: EntityListItemProps ) {
    const anchorRef = useTourAnchor( entityListAnchor( name ) );

    return (
        <div
            ref={ anchorRef }
            className="px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700/50 rounded cursor-pointer truncate"
            title={ name }
            onClick={ onSelect }
        >
            { name }
        </div>
    );
}

interface EntityListSelectedState {
    moduleFlowsData: FlowEditorState[ "moduleFlowsData" ];
}

export function EntityList() {
    const [ state ] = useCommandState<FlowEditorState, EntityListSelectedState>(
        "Dashboard/FlowEditor",
        ( state: FlowEditorState ): EntityListSelectedState => ( {
            moduleFlowsData: state.moduleFlowsData
        } )
    );

    const selectEntity = useCommand( "Dashboard/FlowEditor/SelectEntity" );

    const showsExtraModules = useExtraModulesStore( ( state ) => state.showsExtraModules );

    const handleEntitySelect = ( entityType: EntityType, entityName: string ) => {
        selectEntity.run( { entityType, entityName } );
    };

    const [ searchTerm, setSearchTerm ] = useState( "" );
    const moduleFlowsData = state.moduleFlowsData;

    const entityGroups = useMemo<EntityGroup[]>( () => {
        if ( !moduleFlowsData ) {
            return [];
        }

        const reachable = computeReachableFlows( moduleFlowsData );

        // The list offers what the canvas draws. Without this it would offer to select a flow that
        // is not there, and selecting it would do nothing at all.
        const drawn = ( name: string ) => showsExtraModules || ! isForeignTo( name, moduleFlowsData.module );

        const modals = new Set<string>();

        moduleFlowsData.components
            .filter( ( component ) => drawn( component.name ) )
            .forEach( ( component ) => {
                component.modals.filter( drawn ).forEach( ( modal ) => modals.add( modal ) );
            } );

        return [
            {
                label: "Flows",
                type: "flow" as EntityType,
                color: MINIMAP_COLORS.FLOW,
                items: moduleFlowsData.flows
                    .filter( ( f ) => ( reachable.size === 0 || reachable.has( f.name ) ) && drawn( f.name ) )
                    .map( ( f ) => f.name )
            },
            {
                label: "System Flows",
                type: "systemFlow" as EntityType,
                color: MINIMAP_COLORS.SYSTEM_FLOW,
                items: moduleFlowsData.systemFlows.filter( ( f ) => drawn( f.name ) ).map( ( f ) => f.name )
            },
            {
                label: "Components",
                type: "component" as EntityType,
                color: MINIMAP_COLORS.COMPONENT,
                items: moduleFlowsData.components.filter( ( c ) => drawn( c.name ) ).map( ( c ) => c.name )
            },
            {
                label: "Modals",
                type: "modal" as EntityType,
                color: MINIMAP_COLORS.MODAL,
                items: Array.from( modals )
            }
        ].filter( ( group ) => group.items.length > 0 );
    }, [ moduleFlowsData, showsExtraModules ] );

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

                <ExtraModulesToggle />
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
                                <EntityListItem
                                    key={ item }
                                    name={ item }
                                    onSelect={ () => handleEntitySelect( group.type, item ) }
                                />
                            ) ) }
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
}
