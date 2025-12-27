import type { Node } from "@xyflow/react";
import type { ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { UIExportedFlow, UIExportedComponent } from "@vertix.gg/definitions/src/ui-export-definitions";

interface FlowDetailsPanelProps {
    moduleFlowsData: ModuleFlowsResponse | null;
    selectedNode: Node | null;
    onClearSelection: () => void;
}

function getFlowComponentNames( flow: UIExportedFlow, allComponents: UIExportedComponent[] ): string[] {
    const componentNames = new Set<string>();

    flow.states.forEach( state => {
        if ( state.component ) {
            componentNames.add( state.component );
        }
    } );

    return allComponents
        .filter( c => componentNames.has( c.name ) )
        .map( c => c.name.split( "/" ).pop() ?? c.name );
}

function NodeDetailsView( props: { node: Node; moduleFlowsData: ModuleFlowsResponse; onClearSelection: () => void } ) {
    const { node, moduleFlowsData, onClearSelection } = props;
    const nodeData = node.data;
    const nodeType = nodeData?.type as string | undefined;

    const getNodeTypeColor = () => {
        switch ( nodeType ) {
            case "module": return "bg-indigo-500";
            case "flow": return nodeData?.isSystemFlow ? "bg-amber-500" : "bg-emerald-500";
            case "component": return "bg-purple-500";
            case "modal": return "bg-pink-500";
            default: return "bg-zinc-500";
        }
    };

    const getNodeTypeLabel = () => {
        switch ( nodeType ) {
            case "module": return "Module";
            case "flow": return nodeData?.isSystemFlow ? "System Flow" : "Flow";
            case "component": return "Component";
            case "modal": return "Modal";
            default: return "Unknown";
        }
    };

    const renderFlowDetails = () => {
        const flowName = nodeData?.label as string;
        const flow = [ ...moduleFlowsData.flows, ...moduleFlowsData.systemFlows ].find(
            f => f.name.split( "/" ).pop() === flowName || f.name === flowName
        );

        if ( !flow ) return null;

        return (
            <>
                <div>
                    <label className="text-xs text-zinc-400 uppercase font-medium">Initial State</label>
                    <p className="text-zinc-300 text-xs mt-1 break-all">
                        { flow.initialState?.split( "/" ).pop() ?? "N/A" }
                    </p>
                </div>

                { flow.states.length > 0 && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            States ({ flow.states.length })
                        </label>
                        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            { flow.states.map( ( state ) => (
                                <li key={ state.key } className="text-zinc-300 text-xs bg-zinc-700/50 px-2 py-1 rounded">
                                    { state.key.split( "/" ).pop() }
                                    { state.component && (
                                        <span className="text-purple-400 ml-1">
                                            → { state.component.split( "/" ).pop() }
                                        </span>
                                    ) }
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }

                { flow.transitions && flow.transitions.length > 0 && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            Transitions ({ flow.transitions.length })
                        </label>
                        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            { flow.transitions.map( ( transition, idx ) => (
                                <li key={ idx } className="text-zinc-300 text-xs bg-zinc-700/50 px-2 py-1 rounded">
                                    <div>{ transition.from?.split( "/" ).pop() }</div>
                                    <div className="text-emerald-400">→ { transition.to?.split( "/" ).pop() }</div>
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }

                { flow.handoffPoints && flow.handoffPoints.length > 0 && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            Handoff Points ({ flow.handoffPoints.length })
                        </label>
                        <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            { flow.handoffPoints.map( ( hp, idx ) => (
                                <li key={ idx } className="text-zinc-300 text-xs bg-amber-900/30 border border-amber-700/50 px-2 py-1 rounded">
                                    { hp.flowName?.split( "/" ).pop() }
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }
            </>
        );
    };

    const renderComponentDetails = () => {
        const componentName = nodeData?.label as string;
        const component = moduleFlowsData.components.find(
            c => c.name.split( "/" ).pop() === componentName || c.name === componentName
        );
        const stateKey = nodeData?.stateKey as string | undefined;

        if ( !component ) return null;

        return (
            <>
                { stateKey && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">State</label>
                        <p className="text-zinc-300 text-xs mt-1 break-all">
                            { stateKey.split( "/" ).pop() ?? stateKey }
                        </p>
                    </div>
                ) }

                <div>
                    <label className="text-xs text-zinc-400 uppercase font-medium">Instance Type</label>
                    <p className="text-zinc-300 text-xs mt-1">{ component.instanceType }</p>
                </div>

                { component.elementsGroups.length > 0 && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            Element Groups ({ component.elementsGroups.length })
                        </label>
                        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            { component.elementsGroups.map( ( group ) => (
                                <li key={ group.name } className="text-zinc-300 text-xs bg-zinc-700/50 px-2 py-1 rounded">
                                    <div className="font-medium">{ group.name.split( "/" ).pop() }</div>
                                    <div className="text-[10px] text-zinc-500 mt-0.5">
                                        { group.items.flat().length } elements
                                    </div>
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }

                { component.embedsGroups.length > 0 && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            Embed Groups ({ component.embedsGroups.length })
                        </label>
                        <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            { component.embedsGroups.map( ( group ) => (
                                <li key={ group.name } className="text-zinc-300 text-xs bg-zinc-700/50 px-2 py-1 rounded">
                                    { group.name.split( "/" ).pop() }
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }

                { component.modals.length > 0 && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            Modals ({ component.modals.length })
                        </label>
                        <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            { component.modals.map( ( modal ) => (
                                <li key={ modal } className="text-zinc-300 text-xs bg-pink-900/30 border border-pink-700/50 px-2 py-1 rounded">
                                    { modal.split( "/" ).pop() }
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }
            </>
        );
    };

    const renderModalDetails = () => {
        const modalData = nodeData as Record<string, string | { name: string; label?: string; placeholder?: string }[] | undefined>;

        return (
            <>
                { modalData?.title && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">Title</label>
                        <p className="text-zinc-300 text-xs mt-1">{ modalData.title as string }</p>
                    </div>
                ) }

                { modalData?.inputs && Array.isArray( modalData.inputs ) && (
                    <div>
                        <label className="text-xs text-zinc-400 uppercase font-medium">
                            Inputs ({ modalData.inputs.length })
                        </label>
                        <ul className="mt-2 space-y-1">
                            { modalData.inputs.map( ( input, idx ) => (
                                <li key={ idx } className="text-zinc-300 text-xs bg-zinc-700/50 px-2 py-1 rounded">
                                    <div className="font-medium">{ input.name?.split( "/" ).pop() ?? `Input ${ idx + 1 }` }</div>
                                    { input.label && (
                                        <div className="text-[10px] text-zinc-500">Label: { input.label }</div>
                                    ) }
                                    { input.placeholder && (
                                        <div className="text-[10px] text-zinc-500">Placeholder: { input.placeholder }</div>
                                    ) }
                                </li>
                            ) ) }
                        </ul>
                    </div>
                ) }
            </>
        );
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={ `w-3 h-3 rounded ${ getNodeTypeColor() }` }></span>
                    <span className="text-xs text-zinc-400 uppercase font-medium">{ getNodeTypeLabel() }</span>
                </div>
                <button
                    onClick={ onClearSelection }
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Clear selection"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div>
                <label className="text-xs text-zinc-400 uppercase font-medium">Name</label>
                <p className="text-white text-sm mt-1 font-medium">{ nodeData?.label as string ?? node.id }</p>
            </div>

            <div>
                <label className="text-xs text-zinc-400 uppercase font-medium">Node ID</label>
                <p className="text-zinc-400 text-xs mt-1 break-all font-mono">{ node.id }</p>
            </div>

            { nodeType === "flow" && renderFlowDetails() }
            { nodeType === "component" && renderComponentDetails() }
            { nodeType === "modal" && renderModalDetails() }
        </div>
    );
}

function ModuleOverview( props: { moduleFlowsData: ModuleFlowsResponse } ) {
    const { moduleFlowsData } = props;
    const moduleName = moduleFlowsData.module.split( "/" ).pop() ?? moduleFlowsData.module;

    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="text-xs text-zinc-400 uppercase font-medium">Name</label>
                <p className="text-white text-sm mt-1">{ moduleName }</p>
            </div>

            <div>
                <label className="text-xs text-zinc-400 uppercase font-medium">Full Path</label>
                <p className="text-zinc-300 text-xs mt-1 break-all">{ moduleFlowsData.module }</p>
            </div>

            <div>
                <label className="text-xs text-zinc-400 uppercase font-medium">
                    Components ({ moduleFlowsData.components.length })
                </label>
                <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    { moduleFlowsData.components.map( ( component ) => (
                        <li key={ component.name } className="text-zinc-300 text-xs bg-purple-900/30 border border-purple-700/50 px-2 py-1 rounded">
                            { component.name.split( "/" ).pop() }
                        </li>
                    ) ) }
                </ul>
            </div>

            { moduleFlowsData.systemFlows.length > 0 && (
                <div>
                    <label className="text-xs text-zinc-400 uppercase font-medium">
                        System Flows ({ moduleFlowsData.systemFlows.length })
                    </label>
                    <ul className="mt-2 space-y-2">
                        { moduleFlowsData.systemFlows.map( ( flow ) => {
                            const componentNames = getFlowComponentNames( flow, moduleFlowsData.components );
                            return (
                                <li key={ flow.name } className="text-zinc-300 text-xs bg-amber-900/30 border border-amber-700/50 px-2 py-2 rounded">
                                    <div className="font-medium">{ flow.name.split( "/" ).pop() }</div>
                                    { componentNames.length > 0 && (
                                        <div className="mt-1 text-[10px] text-zinc-400">
                                            Components: { componentNames.join( ", " ) }
                                        </div>
                                    ) }
                                </li>
                            );
                        } ) }
                    </ul>
                </div>
            ) }

            <div>
                <label className="text-xs text-zinc-400 uppercase font-medium">
                    Flows ({ moduleFlowsData.flows.length })
                </label>
                <ul className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                    { moduleFlowsData.flows.map( ( flow ) => {
                        const componentNames = getFlowComponentNames( flow, moduleFlowsData.components );
                        return (
                            <li key={ flow.name } className="text-zinc-300 text-xs bg-emerald-900/30 border border-emerald-700/50 px-2 py-2 rounded">
                                <div className="font-medium">{ flow.name.split( "/" ).pop() }</div>
                                { componentNames.length > 0 && (
                                    <div className="mt-1 text-[10px] text-zinc-400">
                                        Components: { componentNames.join( ", " ) }
                                    </div>
                                ) }
                            </li>
                        );
                    } ) }
                </ul>
            </div>

            <div className="pt-4 border-t border-zinc-700">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-3 h-3 rounded bg-indigo-500"></span> Module
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                    <span className="w-3 h-3 rounded bg-amber-500"></span> System Flow
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span> Flow
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                    <span className="w-3 h-3 rounded bg-purple-500"></span> Component
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                    <span className="w-3 h-3 rounded bg-pink-500"></span> Modal
                </div>
            </div>
        </div>
    );
}

export function FlowDetailsPanel( props: FlowDetailsPanelProps ) {
    const { moduleFlowsData, selectedNode, onClearSelection } = props;

    if ( !moduleFlowsData ) {
        return null;
    }

    const isModuleSelected = selectedNode?.data?.type === "module";
    const panelTitle = selectedNode && !isModuleSelected ? "Node Details" : "Module Details";

    return (
        <div className="h-full bg-zinc-800 border-l border-zinc-700 overflow-y-auto">
            <div className="p-4 border-b border-zinc-700">
                <h3 className="text-lg font-semibold text-white">{ panelTitle }</h3>
            </div>

            { selectedNode && !isModuleSelected ? (
                <NodeDetailsView
                    node={ selectedNode }
                    moduleFlowsData={ moduleFlowsData }
                    onClearSelection={ onClearSelection }
                />
            ) : (
                <ModuleOverview moduleFlowsData={ moduleFlowsData } />
            ) }
        </div>
    );
}
