import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState } from "@zenflux/react-commander/hooks";

import { ResizablePanel } from "@vertix.gg/dashboard/src/components/resizable-panel";
import { FlowDetailsPanel } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-details-panel";
import { FlowViewer } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-viewer";
import { ModuleSelector } from "@vertix.gg/dashboard/src/features/flow-editor/components/module-selector";
import { EntityList } from "@vertix.gg/dashboard/src/features/flow-editor/components/entity-list";

import {
    SelectModuleCommand,
    SelectNodeCommand,
    SelectEntityCommand,
    ClearErrorCommand,
    FLOW_EDITOR_INITIAL_STATE
} from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";

import type { FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";
import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";

export interface FlowEditorProps {
    $data?: ModuleInfo[];
}

export type { FlowEditorState };

interface FlowEditorHeaderSelectedState {
    selectedModule: FlowEditorState[ "selectedModule" ];
    isLoading: FlowEditorState[ "isLoading" ];
    error: FlowEditorState[ "error" ];
}

const FlowEditorComponent: DCommandFunctionComponent<FlowEditorProps, FlowEditorState> = () => {
    const [ state ] = useCommandState<FlowEditorState, FlowEditorHeaderSelectedState>(
        "Dashboard/FlowEditor",
        ( state: FlowEditorState ): FlowEditorHeaderSelectedState => ( {
            selectedModule: state.selectedModule,
            isLoading: state.isLoading,
            error: state.error
        } )
    );

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
                    <ModuleSelector />
                    { state.error && (
                        <div className="p-4 text-red-400 text-sm">
                            { state.error }
                        </div>
                    ) }
                    <EntityList />
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
                    <FlowViewer />
                </div>
            </div>

            <ResizablePanel
                defaultWidth={ 320 }
                minWidth={ 250 }
                maxWidth={ 1000 }
                side="right"
                storageKey="vertix-dashboard-right-panel-width"
            >
                <FlowDetailsPanel />
            </ResizablePanel>
        </div>
    );
};

FlowEditorComponent.getName = () => "Dashboard/FlowEditor";

export const FlowEditor = withCommands<FlowEditorProps, FlowEditorState>(
    "Dashboard/FlowEditor",
    FlowEditorComponent,
    FLOW_EDITOR_INITIAL_STATE,
    [ SelectModuleCommand, SelectNodeCommand, SelectEntityCommand, ClearErrorCommand ]
);

