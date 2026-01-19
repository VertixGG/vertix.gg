import { CommandBase } from "@zenflux/react-commander/command-base";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/features/flow-editor/lib/graph-builder";

import type { ModuleInfo, ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { EntityType } from "@vertix.gg/dashboard/src/features/flow-editor/components/entity-list";
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

export const FLOW_EDITOR_INITIAL_STATE: FlowEditorState = {
    modules: [],
    selectedModule: null,
    moduleFlowsData: null,
    selectedNode: null,
    centerOnSelect: false,
    isLoading: false,
    error: null
};

export class SelectModuleCommand extends CommandBase<FlowEditorState, { moduleName: string | null }> {
    public static getName(): string {
        return "Dashboard/FlowEditor/SelectModule";
    }

    public async apply( args: { moduleName: string | null } ) {
        if ( !args.moduleName ) {
            return this.setState( {
                selectedModule: null,
                moduleFlowsData: null,
                selectedNode: null
            } );
        }

        this.setState( {
            selectedModule: args.moduleName,
            moduleFlowsData: null,
            selectedNode: null,
            isLoading: true
        } );

        try {
            const response = await apiClient.get<ModuleFlowsResponse>( "/flows", {
                params: { moduleName: args.moduleName }
            } );

            return this.setState( {
                moduleFlowsData: response.data,
                isLoading: false
            } );
        } catch( error ) {
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to fetch module data",
                isLoading: false
            } );
        }
    }
}

export class SelectNodeCommand extends CommandBase<FlowEditorState, { node: Node | null; centerOnSelect?: boolean }> {
    public static getName(): string {
        return "Dashboard/FlowEditor/SelectNode";
    }

    public async apply( args: { node: Node | null; centerOnSelect?: boolean } ) {
        return this.setState( {
            selectedNode: args.node,
            centerOnSelect: args.centerOnSelect ?? false
        } );
    }
}

export class SelectEntityCommand extends CommandBase<FlowEditorState, { entityType: EntityType; entityName: string }> {
    public static getName(): string {
        return "Dashboard/FlowEditor/SelectEntity";
    }

    public apply( args: { entityType: EntityType; entityName: string } ) {
        const { entityType, entityName } = args;

        if ( !this.state.moduleFlowsData ) {
            return;
        }

        const graphNodes = buildFlowGraph( this.state.moduleFlowsData ).nodes;
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
            return this.setState( {
                selectedNode: matchedNode,
                centerOnSelect: true
            } );
        }
    }
}

export class ClearErrorCommand extends CommandBase<FlowEditorState> {
    public static getName(): string {
        return "Dashboard/FlowEditor/ClearError";
    }

    public apply() {
        return this.setState( { error: null } );
    }
}
