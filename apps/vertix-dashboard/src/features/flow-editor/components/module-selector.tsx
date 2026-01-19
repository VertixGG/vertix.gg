import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";

interface ModuleSelectorSelectedState {
    modules: FlowEditorState[ "modules" ];
    selectedModule: FlowEditorState[ "selectedModule" ];
}

export function ModuleSelector() {
    const [ state ] = useCommandState<FlowEditorState, ModuleSelectorSelectedState>(
        "Dashboard/FlowEditor",
        ( state: FlowEditorState ): ModuleSelectorSelectedState => ( {
            modules: state.modules,
            selectedModule: state.selectedModule
        } )
    );

    const selectModule = useCommand( "Dashboard/FlowEditor/SelectModule" );

    const handleSelect = ( moduleName: string | null ) => {
        selectModule.run( { moduleName } );
    };

    return (
        <div className="p-4 border-b border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
                Select Module
            </label>
            <select
                value={ state.selectedModule || "" }
                onChange={ ( e ) => handleSelect( e.target.value || null ) }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">-- Select a module --</option>
                { state.modules.map( ( module: ModuleInfo ) => (
                    <option key={ module.name } value={ module.name }>
                        { module.shortName } ({ module.flows } flows, { module.components } components)
                    </option>
                ) ) }
            </select>
        </div>
    );
}
