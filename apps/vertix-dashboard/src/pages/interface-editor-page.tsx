import { QueryComponent } from "@zenflux/react-commander/query/component";

import { FlowEditor } from "@vertix.gg/dashboard/src/features/flow-editor/flow-editor";

import { ModulesQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/modules-query";

import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { FlowEditorProps, FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/flow-editor";

export function InterfaceEditorPage() {
    return (
        <QueryComponent<ModuleInfo[], FlowEditorProps, ModuleInfo[], FlowEditorState>
            fallback={ <div className="flex items-center justify-center h-full text-zinc-400">Loading...</div> }
            module={ ModulesQuery }
            component={ FlowEditor }
            props={ {} }
        />
    );
}
