import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { ALL_MODULES } from "@vertix.gg/definitions/src/ui-export-definitions";

import { useTourAnchor } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-anchor";
import { TOUR_ANCHORS } from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-anchors";

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

    const moduleSelectRef = useTourAnchor( TOUR_ANCHORS.MODULE_SELECT );

    const handleSelect = ( moduleName: string | null ) => {
        selectModule.run( { moduleName } );
    };

    /*
     * Summed off the rows below rather than asked for separately.
     *
     * A component belongs to one module, so the sums are the totals rather than a double count, and
     * taking them from the same numbers the other rows print is what keeps this row honest when one
     * of them changes.
     */
    const totalFlows = state.modules.reduce( ( total, module: ModuleInfo ) => total + module.flows, 0 ),
        totalComponents = state.modules.reduce( ( total, module: ModuleInfo ) => total + module.components, 0 );

    return (
        <div className="p-4 border-b border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
                Select Module
            </label>
            <select
                ref={ moduleSelectRef }
                value={ state.selectedModule || "" }
                onChange={ ( e ) => handleSelect( e.target.value || null ) }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">-- Select a module --</option>
                { 1 < state.modules.length && (
                    <option value={ ALL_MODULES }>
                        All modules ({ totalFlows } flows, { totalComponents } components)
                    </option>
                ) }
                { state.modules.map( ( module: ModuleInfo ) => (
                    <option key={ module.name } value={ module.name }>
                        { module.shortName } ({ module.flows } flows, { module.components } components)
                    </option>
                ) ) }
            </select>
        </div>
    );
}
