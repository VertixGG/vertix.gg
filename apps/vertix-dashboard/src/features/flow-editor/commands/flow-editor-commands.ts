import zCore from "@zenflux/core";
import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/features/flow-editor/lib/graph-builder";
import { useSelectedGuildStore } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";
import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";
import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";

import type { ModuleInfo, ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { EntityType } from "@vertix.gg/dashboard/src/features/flow-editor/components/entity-list";
import type { Node } from "@xyflow/react";
import type { GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

const logger = zCore.modules.createLogger( "flow-editor-commands" );

/**
 * Compare current node data against the last saved state to determine if there are unsaved changes.
 * Uses JSON serialization as a checksum so the Save button automatically
 * enables/disables as fields are edited or reverted back.
 */
function computeHasChanges( nodeData: unknown, lastSavedData: unknown ): boolean {
    return JSON.stringify( nodeData ) !== JSON.stringify( lastSavedData );
}

export interface FlowEditorState {
    modules: ModuleInfo[];
    selectedModule: string | null;
    moduleFlowsData: ModuleFlowsResponse | null;
    selectedNode: Node | null;
    originalNodeData: Record<string, unknown> | null;
    /** Snapshot of node data after the last successful save (or after DB overrides are applied). */
    lastSavedData: Record<string, unknown> | null;
    hasUnsavedChanges: boolean;
    centerOnSelect: boolean;
    isLoading: boolean;
    error: string | null;
}

export const FLOW_EDITOR_INITIAL_STATE: FlowEditorState = {
    modules: [],
    selectedModule: null,
    moduleFlowsData: null,
    selectedNode: null,
    originalNodeData: null,
    lastSavedData: null,
    hasUnsavedChanges: false,
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
        // Store original node data when selecting a new node
        const originalNodeData = args.node
            ? JSON.parse( JSON.stringify( args.node.data ) ) as Record<string, unknown>
            : null;

        return this.setState( {
            selectedNode: args.node,
            originalNodeData,
            lastSavedData: originalNodeData ? JSON.parse( JSON.stringify( originalNodeData ) ) : null,
            hasUnsavedChanges: false,
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

export class UpdateNodeDataCommand extends CommandBase<FlowEditorState, { path: string; value: unknown; isInitialLoad?: boolean; isSavedOverride?: boolean }> {
    public static getName(): string {
        return "Dashboard/FlowEditor/UpdateNodeData";
    }

    public apply( args: { path: string; value: unknown; isInitialLoad?: boolean; isSavedOverride?: boolean } ) {
        const { path, value, isInitialLoad, isSavedOverride } = args;
        const selectedNode = this.state.selectedNode;

        if ( !selectedNode ) {
            return;
        }

        // Deep clone the node to avoid mutating state directly
        const updatedNode = JSON.parse( JSON.stringify( selectedNode ) ) as Node;

        // Parse path and set value (e.g., "embed.title", "embed.color")
        const pathParts = path.split( "." );
        let current: Record<string, unknown> = updatedNode.data as Record<string, unknown>;

        for ( let i = 0; i < pathParts.length - 1; i++ ) {
            const part = pathParts[ i ];
            if ( current[ part ] === undefined ) {
                current[ part ] = {};
            }
            current = current[ part ] as Record<string, unknown>;
        }

        current[ pathParts[ pathParts.length - 1 ] ] = value;

        // If this is an initial load (applying translations/embed overrides), also update originalNodeData
        if ( isInitialLoad ) {
            const newOriginalData = JSON.parse( JSON.stringify( updatedNode.data ) ) as Record<string, unknown>;
            return this.setState( {
                selectedNode: updatedNode,
                originalNodeData: newOriginalData,
                lastSavedData: JSON.parse( JSON.stringify( updatedNode.data ) ) as Record<string, unknown>,
                hasUnsavedChanges: false
            } );
        }

        // Saved override: apply DB values on top of the node without updating originalNodeData,
        // so Restore goes back to the true definition defaults, not the DB-saved values.
        // Update lastSavedData since this represents the current DB state.
        if ( isSavedOverride ) {
            const newLastSaved = JSON.parse( JSON.stringify( updatedNode.data ) ) as Record<string, unknown>;
            return this.setState( {
                selectedNode: updatedNode,
                lastSavedData: newLastSaved,
                hasUnsavedChanges: false
            } );
        }

        return this.setState( {
            selectedNode: updatedNode,
            hasUnsavedChanges: computeHasChanges( updatedNode.data, this.state.lastSavedData )
        } );
    }
}

export class RestoreNodeDataCommand extends CommandBase<FlowEditorState> {
    public static getName(): string {
        return "Dashboard/FlowEditor/RestoreNodeData";
    }

    public apply() {
        const { selectedNode, originalNodeData } = this.state;

        if ( !selectedNode || !originalNodeData ) {
            return;
        }

        // Restore the node data to its original (definition default) state
        const restoredData = JSON.parse( JSON.stringify( originalNodeData ) );
        const restoredNode = {
            ...selectedNode,
            data: restoredData
        } as Node;

        return this.setState( {
            selectedNode: restoredNode,
            hasUnsavedChanges: computeHasChanges( restoredData, this.state.lastSavedData )
        } );
    }
}

export class SaveNodeChangesCommand extends CommandBase<FlowEditorState> {
    public static getName(): string {
        return "Dashboard/FlowEditor/SaveNodeChanges";
    }

    public async apply() {
        const { selectedNode, originalNodeData } = this.state;

        if ( !selectedNode ) {
            return;
        }

        const guildId = useSelectedGuildStore.getState().selectedGuild?.id;
        if ( !guildId ) {
            logger.error( this.apply, "No guild selected" );
            return;
        }

        const customizationKey = selectedNode.data?.customizationKey as string | undefined;
        if ( !customizationKey ) {
            logger.error( this.apply, "No customizationKey in node data" );
            return;
        }

        // Extract customization data from node
        const embed = selectedNode.data?.embed as Record<string, unknown> | undefined;
        const originalEmbed = originalNodeData?.embed as Record<string, unknown> | undefined;

        // Build the customization object with changed values
        const embedOverrides: Record<string, unknown> = {};

        if ( embed ) {
            // Check for color changes
            if ( embed.color !== undefined && embed.color !== originalEmbed?.color ) {
                embedOverrides.color = embed.color;
            }
            // Check for title changes
            if ( embed.title !== undefined && embed.title !== originalEmbed?.title ) {
                embedOverrides.title = embed.title;
            }
            // Check for description changes
            if ( embed.description !== undefined && embed.description !== originalEmbed?.description ) {
                embedOverrides.description = embed.description;
            }
        }

        // Check for variable overrides (defaultVars + options changes in embedDefinition)
        const embedDefinition = selectedNode.data?.embedDefinition as Record<string, unknown> | undefined;
        const originalEmbedDefinition = originalNodeData?.embedDefinition as Record<string, unknown> | undefined;
        const variables: Record<string, unknown> = {};

        if ( embedDefinition ) {
            const currentDefaultVars = embedDefinition.defaultVars as Record<string, string> | undefined;
            const originalDefaultVars = originalEmbedDefinition?.defaultVars as Record<string, string> | undefined;

            if ( currentDefaultVars ) {
                for ( const [ key, value ] of Object.entries( currentDefaultVars ) ) {
                    if ( value !== originalDefaultVars?.[ key ] ) {
                        variables[ key ] = value;
                    }
                }
            }

            const currentOptions = embedDefinition.options as Record<string, unknown> | undefined;
            const originalOptions = originalEmbedDefinition?.options as Record<string, unknown> | undefined;

            if ( currentOptions ) {
                for ( const [ key, value ] of Object.entries( currentOptions ) ) {
                    if ( JSON.stringify( value ) !== JSON.stringify( originalOptions?.[ key ] ) ) {
                        variables[ `__option__${ key }` ] = value;
                    }
                }
            }
        }

        const selectedLanguage = useLanguageStore.getState().selectedLanguage;
        const hasVariables = Object.keys( variables ).length > 0;

        logger.debug( this.apply, "Saving customization", { guildId, customizationKey, embedOverrides, variables: hasVariables ? variables : undefined, languageCode: selectedLanguage } );

        try {
            // Save to database using query module
            const queryModule = getQueryModule( CustomizationQuery );
            const isDefault = guildId === "__default__";
            const customization: Record<string, unknown> = {
                embedOverrides: embedOverrides as { title?: string; description?: string; color?: number }
            };

            if ( hasVariables ) {
                customization.variables = variables;
            }

            await queryModule.request<GuildCustomizationData>(
                isDefault ? "Dashboard/Customization/UpdateDefaultComponent" : "Dashboard/Customization/UpdateComponent",
                isDefault
                    ? {
                        customizationKey,
                        customization,
                        languageCode: selectedLanguage
                    }
                    : {
                        guildId,
                        customizationKey,
                        customization,
                        languageCode: selectedLanguage
                    }
            );

            logger.debug( this.apply, "Save successful" );

            // Trigger refresh of customizat`ions in FlowViewer
            const refreshFn = ( window as unknown as Record<string, () => void> ).__refreshFlowCustomization;
            if ( refreshFn ) {
                refreshFn();
            }

            // Update local state — after save, the current data becomes both the
            // original (for Restore) and the last-saved baseline (for change detection).
            const savedSnapshot = JSON.parse( JSON.stringify( selectedNode.data ) ) as Record<string, unknown>;

            return this.setState( {
                originalNodeData: savedSnapshot,
                lastSavedData: JSON.parse( JSON.stringify( savedSnapshot ) ),
                hasUnsavedChanges: false
            } );
        } catch( error ) {
            logger.error( this.apply, "Failed to save", error );
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to save changes"
            } );
        }
    }
}
