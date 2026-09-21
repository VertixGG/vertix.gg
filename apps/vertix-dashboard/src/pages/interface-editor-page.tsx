import { QueryComponent } from "@zenflux/react-commander/query/component";

import { QueryErrorBoundary } from "@vertix.gg/dashboard/src/components/query-error-boundary";

import { FlowEditor } from "@vertix.gg/dashboard/src/features/flow-editor/flow-editor";

import { ModulesQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/modules-query";

import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { FlowEditorProps, FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/flow-editor";

const MODULES_UNAVAILABLE_HINT = <>
    The api collects the interface definitions from the bot when it is asked for them, and could
    not this time. It tries again on its own, so reloading in a moment usually answers - if it does
    not, the api&apos;s log names the adapter it could not register.
</>;

export function InterfaceEditorPage() {
    return (
        // The modules list is what every other panel here is drawn from, so there is nothing to
        // show beside a failure to load it - the boundary replaces the screen rather than sitting
        // inside it.
        <QueryErrorBoundary title="The interface editor could not be loaded" hint={ MODULES_UNAVAILABLE_HINT }>
            <QueryComponent<ModuleInfo[], FlowEditorProps, ModuleInfo[], FlowEditorState>
                fallback={ <div className="flex items-center justify-center h-full text-zinc-400">Loading...</div> }
                module={ ModulesQuery }
                component={ FlowEditor }
                props={ {} }
            />
        </QueryErrorBoundary>
    );
}
