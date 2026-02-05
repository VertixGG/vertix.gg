import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { ResizablePanel } from "@vertix.gg/dashboard/src/components/resizable-panel";
import { FlowViewer } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-viewer";
import { ModuleSelector } from "@vertix.gg/dashboard/src/features/flow-editor/components/module-selector";
import { EntityList } from "@vertix.gg/dashboard/src/features/flow-editor/components/entity-list";
import { FlowEditSidebar } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-edit-sidebar";
import { LanguageSelector } from "@vertix.gg/dashboard/src/features/flow-editor/components/language-selector";
import { useEditMode } from "@vertix.gg/dashboard/src/hooks/use-edit-mode";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";

import {
    SelectModuleCommand,
    SelectNodeCommand,
    SelectEntityCommand,
    ClearErrorCommand,
    UpdateNodeDataCommand,
    RestoreNodeDataCommand,
    SaveNodeChangesCommand,
    FLOW_EDITOR_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";

import type { FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";
import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";

export interface FlowEditorProps {
    $data?: ModuleInfo[];
}

export type { FlowEditorState };

interface FlowEditorSelectedState {
    selectedModule: FlowEditorState[ "selectedModule" ];
    moduleFlowsData: FlowEditorState[ "moduleFlowsData" ];
    isLoading: FlowEditorState[ "isLoading" ];
    error: FlowEditorState[ "error" ];
}

const FlowEditorComponent: DCommandFunctionComponent<FlowEditorProps, FlowEditorState> = () => {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const selectModule = useCommand( "Dashboard/FlowEditor/SelectModule" );

    const [ state ] = useCommandState<FlowEditorState, FlowEditorSelectedState>(
        "Dashboard/FlowEditor",
        ( state: FlowEditorState ): FlowEditorSelectedState => ( {
            selectedModule: state.selectedModule,
            moduleFlowsData: state.moduleFlowsData,
            isLoading: state.isLoading,
            error: state.error
        } )
    );

    const { isEditMode, editingFlowName, enterEditMode } = useEditMode();
    const guildId = useSelectedGuildId();

    // --- URL → State restoration ---

    // Capture initial URL params once on mount (immune to sync effect clearing them)
    const initialParamsRef = useRef<{ module: string | null; edit: string | null } | null>( null );
    if ( initialParamsRef.current === null ) {
        initialParamsRef.current = {
            module: searchParams.get( "module" ),
            edit: searchParams.get( "edit" )
        };
    }

    // Track whether URL restoration is complete (both module + edit handled)
    const urlRestorationDoneRef = useRef( false );

    // Restore module from URL on mount
    const restoredModuleRef = useRef( false );
    useEffect( () => {
        if ( restoredModuleRef.current ) {
            return;
        }

        const moduleParam = initialParamsRef.current?.module;
        if ( moduleParam && !state.selectedModule ) {
            restoredModuleRef.current = true;
            selectModule.run( { moduleName: moduleParam } );
        }
    }, [ state.selectedModule, selectModule ] );

    // Restore edit mode from URL once module data is loaded.
    // Handles both fresh page loads AND HMR where Zustand may have stale state.
    const restoredEditRef = useRef( false );
    useEffect( () => {
        if ( restoredEditRef.current ) {
            return;
        }

        const editParam = initialParamsRef.current?.edit;

        if ( !editParam ) {
            // No edit param in URL — mark restoration as done
            restoredEditRef.current = true;
            urlRestorationDoneRef.current = true;
            return;
        }

        if ( !state.moduleFlowsData || !guildId ) {
            // Still waiting for module data or guild to be available
            return;
        }

        // Enter edit mode if not already editing, or if the current flow differs from URL
        // (handles stale Zustand state from HMR)
        if ( !isEditMode || editingFlowName !== editParam ) {
            restoredEditRef.current = true;
            enterEditMode( editParam, guildId );

            // Mark restoration done after a tick so enterEditMode state propagates
            // before the sync effect is allowed to run
            queueMicrotask( () => {
                urlRestorationDoneRef.current = true;
            } );
        } else {
            // Already editing the correct flow
            restoredEditRef.current = true;
            urlRestorationDoneRef.current = true;
        }
    }, [ state.moduleFlowsData, guildId, isEditMode, editingFlowName, enterEditMode ] );

    // Mark restoration done if there's no edit param (handles module-only URLs)
    useEffect( () => {
        if ( !initialParamsRef.current?.edit && restoredModuleRef.current ) {
            urlRestorationDoneRef.current = true;
        }
    }, [ state.selectedModule ] );

    // --- State → URL sync ---

    useEffect( () => {
        // Don't sync state→URL until URL restoration is complete,
        // otherwise stale Zustand state overwrites the URL params
        if ( !urlRestorationDoneRef.current ) {
            return;
        }

        setSearchParams( ( prev ) => {
            const next = new URLSearchParams( prev );

            if ( state.selectedModule ) {
                next.set( "module", state.selectedModule );
            } else {
                next.delete( "module" );
            }

            if ( editingFlowName ) {
                next.set( "edit", editingFlowName );
            } else {
                next.delete( "edit" );
            }

            return next;
        }, { replace: true } );
    }, [ state.selectedModule, editingFlowName, setSearchParams ] );

    return (
        <div className="flex h-full">
            <ResizablePanel
                defaultWidth={ 288 }
                minWidth={ 250 }
                maxWidth={ 1000 }
                side="left"
                storageKey="vertix-dashboard-left-panel-width"
            >
                { isEditMode ? (
                    <FlowEditSidebar />
                ) : (
                    <aside className="h-full bg-zinc-800 border-r border-zinc-700 flex flex-col">
                        <div className="p-4 border-b border-zinc-700">
                            <h2 className="text-md font-semibold text-white">Modules</h2>
                        </div>
                        <ModuleSelector />
                        { state.error && (
                            <div className="p-4 text-red-400 text-sm">
                                { state.error }
                            </div>
                        ) }
                        <EntityList />
                    </aside>
                ) }
            </ResizablePanel>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-12 border-b border-zinc-700 flex items-center px-4 bg-zinc-800/50">
                    <h2 className="text-xs font-small text-zinc-300">
                        { state.selectedModule ? `Module: ${ state.selectedModule }` : "Module Viewer" }
                    </h2>
                    { state.isLoading && (
                        <span className="ml-4 text-zinc-500 text-xs">Loading...</span>
                    ) }
                    <div className="ml-auto">
                        <LanguageSelector />
                    </div>
                </header>
                <div className="flex-1">
                    <FlowViewer />
                </div>
            </div>

            { /*<ResizablePanel*/ }
            { /*    defaultWidth={ 320 }*/ }
            { /*    minWidth={ 250 }*/ }
            { /*    maxWidth={ 1000 }*/ }
            { /*    side="right"*/ }
            { /*    storageKey="vertix-dashboard-right-panel-width"*/ }
            { /*>*/ }
            { /*    <FlowDetailsPanel />*/ }
            { /*</ResizablePanel>*/ }
        </div>
    );
};

export const FlowEditor = withCommands<FlowEditorProps, FlowEditorState>(
    "Dashboard/FlowEditor",
    FlowEditorComponent,
    FLOW_EDITOR_INITIAL_STATE,
    [ SelectModuleCommand, SelectNodeCommand, SelectEntityCommand, ClearErrorCommand, UpdateNodeDataCommand, RestoreNodeDataCommand, SaveNodeChangesCommand ]
);
