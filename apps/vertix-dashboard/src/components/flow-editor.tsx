import { useEffect, useState, useCallback, useMemo } from "react";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/lib/graph-builder";

import { ModuleSelector } from "@vertix.gg/dashboard/src/components/module-selector";
import { FlowViewer } from "@vertix.gg/dashboard/src/components/flow-viewer";
import { FlowDetailsPanel } from "@vertix.gg/dashboard/src/components/flow-details-panel";
import { ResizablePanel } from "@vertix.gg/dashboard/src/components/resizable-panel";
import { EntityList } from "@vertix.gg/dashboard/src/components/entity-list";

import type { ModuleInfo, ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { EntityType } from "@vertix.gg/dashboard/src/components/entity-list";
import type { Node } from "@xyflow/react";

export interface FlowEditorState {
    modules: ModuleInfo[];
    selectedModule: string | null;
    moduleFlowsData: ModuleFlowsResponse | null;
    selectedNode: Node | null;
    centerOnSelect: boolean;
    isLoading: boolean;
    error: string | null;
}

export function FlowEditor() {
    const [ state, setState ] = useState<FlowEditorState>( {
        modules: [],
        selectedModule: null,
        moduleFlowsData: null,
        selectedNode: null,
        centerOnSelect: false,
        isLoading: true,
        error: null
    } );

    useEffect( () => {
        async function fetchModules() {
            try {
                const response = await apiClient.get<{ modules: ModuleInfo[] }>( "/modules" );
                setState( ( prev ) => ( {
                    ...prev,
                    modules: response.data.modules,
                    isLoading: false
                } ) );
            } catch( error ) {
                setState( ( prev ) => ( {
                    ...prev,
                    error: error instanceof Error ? error.message : "Failed to fetch modules",
                    isLoading: false
                } ) );
            }
        }

        fetchModules();
    }, [] );

    const handleModuleSelect = useCallback( async( moduleName: string | null ) => {
        if ( !moduleName ) {
            setState( ( prev ) => ( {
                ...prev,
                selectedModule: null,
                moduleFlowsData: null,
                selectedNode: null
            } ) );
            return;
        }

        setState( ( prev ) => ( {
            ...prev,
            selectedModule: moduleName,
            moduleFlowsData: null,
            selectedNode: null,
            isLoading: true
        } ) );

        try {
            const response = await apiClient.get<ModuleFlowsResponse>( "/flows", {
                params: { moduleName }
            } );

            setState( ( prev ) => ( {
                ...prev,
                moduleFlowsData: response.data,
                isLoading: false
            } ) );
        } catch( error ) {
            setState( ( prev ) => ( {
                ...prev,
                error: error instanceof Error ? error.message : "Failed to fetch module data",
                isLoading: false
            } ) );
        }
    }, [] );

    const handleNodeSelect = useCallback( ( node: Node | null ) => {
        setState( ( prev ) => ( {
            ...prev,
            selectedNode: node,
            centerOnSelect: false
        } ) );
    }, [] );

    const graphNodes = useMemo( () => {
        if ( !state.moduleFlowsData ) {
            return [];
        }
        return buildFlowGraph( state.moduleFlowsData ).nodes;
    }, [ state.moduleFlowsData ] );

    const handleEntitySelect = useCallback( ( entityType: EntityType, entityName: string ) => {
        let matchedNode: Node | undefined;

        if ( entityType === "flow" || entityType === "systemFlow" ) {
            const flowNodeId = `flow-${ entityName }`;
            matchedNode = graphNodes.find( ( node ) => node.id === flowNodeId );
        } else if ( entityType === "component" ) {
            matchedNode = graphNodes.find( ( node ) =>
                node.data?.type === "component" && node.id.includes( entityName )
            );
        } else if ( entityType === "modal" ) {
            const modalShortName = entityName.split( "/" ).pop()?.replace( /Modal$/, "" ) ?? "";
            matchedNode = graphNodes.find( ( node ) => {
                const label = node.data?.label;
                return node.data?.type === "modal" && typeof label === "string" && label.includes( modalShortName );
            } );
        }

        if ( matchedNode ) {
            setState( ( prev ) => ( {
                ...prev,
                selectedNode: matchedNode,
                centerOnSelect: true
            } ) );
        }
    }, [ graphNodes ] );

    return (
        <div className="flex h-full">
            <ResizablePanel
                defaultWidth={ 288 }
                minWidth={ 250 }
                maxWidth={ 1000 }
                side="left"
                storageKey="vertix-dashboard-left-panel-width"
            >
                <aside className="h-full bg-zinc-800 border-r border-zinc-700 flex flex-col">
                    <div className="p-4 border-b border-zinc-700">
                        <h2 className="text-lg font-semibold text-white">Modules</h2>
                    </div>
                    <ModuleSelector
                        modules={ state.modules }
                        selectedModule={ state.selectedModule }
                        onSelect={ handleModuleSelect }
                    />
                    { state.error && (
                        <div className="p-4 text-red-400 text-sm">
                            { state.error }
                        </div>
                    ) }
                    <EntityList
                        moduleFlowsData={ state.moduleFlowsData }
                        onEntitySelect={ handleEntitySelect }
                    />
                </aside>
            </ResizablePanel>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-12 border-b border-zinc-700 flex items-center px-4 bg-zinc-800/50">
                    <h2 className="text-sm font-medium text-zinc-300">
                        { state.selectedModule ? `Module: ${ state.selectedModule }` : "Module Viewer" }
                    </h2>
                    { state.isLoading && (
                        <span className="ml-4 text-zinc-500 text-xs">Loading...</span>
                    ) }
                </header>
                <div className="flex-1">
                    <FlowViewer
                        moduleFlowsData={ state.moduleFlowsData }
                        isLoading={ state.isLoading }
                        selectedNodeId={ state.selectedNode?.id ?? null }
                        centerOnSelect={ state.centerOnSelect }
                        onNodeSelect={ handleNodeSelect }
                    />
                </div>
            </div>

            <ResizablePanel
                defaultWidth={ 320 }
                minWidth={ 250 }
                maxWidth={ 1000 }
                side="right"
                storageKey="vertix-dashboard-right-panel-width"
            >
                <FlowDetailsPanel
                    moduleFlowsData={ state.moduleFlowsData }
                    selectedNode={ state.selectedNode }
                    onClearSelection={ () => handleNodeSelect( null ) }
                />
            </ResizablePanel>
        </div>
    );
}
