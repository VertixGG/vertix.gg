import zCore from "@zenflux/core";
import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { ELEMENT_OVERRIDE_STRING_FIELDS } from "@vertix.gg/definitions/src/ui-customization-definitions";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/features/flow-editor/lib/graph-builder";
import { useSelectedGuildStore } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";
import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";
import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";

import type { Node } from "@xyflow/react";
import type { ModuleInfo, ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";
import type { EntityType } from "@vertix.gg/dashboard/src/features/flow-editor/components/entity-list";
import type { GuildCustomizationData, ElementOverride } from "@vertix.gg/definitions/src/ui-customization-definitions";

const logger = zCore.modules.createLogger( "flow-editor-commands" );

/**
 * Compare current node data against the last saved state to determine if there are unsaved changes.
 * Uses JSON serialization as a checksum so the Save button automatically
 * enables/disables as fields are edited or reverted back.
 */
function computeHasChanges( nodeData: unknown, lastSavedData: unknown ): boolean {
    return JSON.stringify( nodeData ) !== JSON.stringify( lastSavedData );
}

/**
 * Snapshot of a dirty (modified but not yet saved) node.
 * Stored in the dirtyNodes map so changes survive node selection switches.
 */
export interface DirtyNodeEntry {
    node: Node;
    originalNodeData: Record<string, unknown>;
    lastSavedData: Record<string, unknown>;
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
    /** Tracks all nodes with unsaved changes, keyed by node ID. */
    dirtyNodes: Record<string, DirtyNodeEntry>;
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
    dirtyNodes: {},
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
                selectedNode: null,
                dirtyNodes: {},
                hasUnsavedChanges: false
            } );
        }

        this.setState( {
            selectedModule: args.moduleName,
            moduleFlowsData: null,
            selectedNode: null,
            dirtyNodes: {},
            hasUnsavedChanges: false,
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
        const { selectedNode: currentNode, originalNodeData: currentOriginal, lastSavedData: currentLastSaved, dirtyNodes } = this.state;
        const updatedDirtyNodes = { ...dirtyNodes };

        // Check if the current node itself has changes (not counting other dirty nodes)
        const currentNodeHasChanges = currentNode && currentLastSaved
            ? computeHasChanges( currentNode.data, currentLastSaved )
            : false;

        // Stash the current node if it has unsaved changes
        if ( currentNode && currentNodeHasChanges && currentOriginal && currentLastSaved ) {
            updatedDirtyNodes[ currentNode.id ] = {
                node: JSON.parse( JSON.stringify( currentNode ) ),
                originalNodeData: JSON.parse( JSON.stringify( currentOriginal ) ),
                lastSavedData: JSON.parse( JSON.stringify( currentLastSaved ) )
            };
        } else if ( currentNode && !currentNodeHasChanges ) {
            // If current node no longer has changes, remove it from dirty map
            delete updatedDirtyNodes[ currentNode.id ];
        }

        // Check if the target node is in the dirty map (user is switching back to a modified node)
        const targetNodeId = args.node?.id;
        const dirtyEntry = targetNodeId ? updatedDirtyNodes[ targetNodeId ] : undefined;

        if ( dirtyEntry ) {
            // Restore the dirty node's state
            delete updatedDirtyNodes[ targetNodeId! ];

            const restoredNodeHasChanges = computeHasChanges( dirtyEntry.node.data, dirtyEntry.lastSavedData );

            return this.setState( {
                selectedNode: dirtyEntry.node,
                originalNodeData: dirtyEntry.originalNodeData,
                lastSavedData: dirtyEntry.lastSavedData,
                hasUnsavedChanges: restoredNodeHasChanges || Object.keys( updatedDirtyNodes ).length > 0,
                dirtyNodes: updatedDirtyNodes,
                centerOnSelect: args.centerOnSelect ?? false
            } );
        }

        // Fresh node selection — no dirty entry exists
        const originalNodeData = args.node
            ? JSON.parse( JSON.stringify( args.node.data ) ) as Record<string, unknown>
            : null;

        return this.setState( {
            selectedNode: args.node,
            originalNodeData,
            lastSavedData: originalNodeData ? JSON.parse( JSON.stringify( originalNodeData ) ) : null,
            hasUnsavedChanges: Object.keys( updatedDirtyNodes ).length > 0,
            dirtyNodes: updatedDirtyNodes,
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

        const hasDirtyNodes = Object.keys( this.state.dirtyNodes ).length > 0;

        // If this is an initial load (applying translations/embed overrides), also update originalNodeData
        if ( isInitialLoad ) {
            const newOriginalData = JSON.parse( JSON.stringify( updatedNode.data ) ) as Record<string, unknown>;
            return this.setState( {
                selectedNode: updatedNode,
                originalNodeData: newOriginalData,
                lastSavedData: JSON.parse( JSON.stringify( updatedNode.data ) ) as Record<string, unknown>,
                hasUnsavedChanges: hasDirtyNodes
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
                hasUnsavedChanges: hasDirtyNodes
            } );
        }

        const nodeHasChanges = computeHasChanges( updatedNode.data, this.state.lastSavedData );

        return this.setState( {
            selectedNode: updatedNode,
            hasUnsavedChanges: nodeHasChanges || Object.keys( this.state.dirtyNodes ).length > 0
        } );
    }
}

export class RestoreNodeDataCommand extends CommandBase<FlowEditorState> {
    public static getName(): string {
        return "Dashboard/FlowEditor/RestoreNodeData";
    }

    public apply() {
        const { selectedNode, originalNodeData, dirtyNodes } = this.state;

        if ( !selectedNode || !originalNodeData ) {
            return;
        }

        // Restore the node data to its original (definition default) state
        const restoredData = JSON.parse( JSON.stringify( originalNodeData ) );
        const restoredNode = {
            ...selectedNode,
            data: restoredData
        } as Node;

        // Remove this node from dirty map since it's being restored
        const updatedDirtyNodes = { ...dirtyNodes };
        delete updatedDirtyNodes[ selectedNode.id ];

        const nodeHasChanges = computeHasChanges( restoredData, this.state.lastSavedData );

        return this.setState( {
            selectedNode: restoredNode,
            hasUnsavedChanges: nodeHasChanges || Object.keys( updatedDirtyNodes ).length > 0,
            dirtyNodes: updatedDirtyNodes
        } );
    }
}

/**
 * Extract customization overrides from a node by comparing against its original data.
 * Returns null if the node has no customizationKey.
 */
function extractNodeCustomization(
    nodeData: Record<string, unknown>,
    originalNodeData: Record<string, unknown>
): { customizationKey: string; customization: Record<string, unknown> } | null {
    const customizationKey = nodeData.customizationKey as string | undefined;
    if ( !customizationKey ) {
        return null;
    }

    // Extract customization data from node
    const embed = nodeData.embed as Record<string, unknown> | undefined;
    const originalEmbed = originalNodeData?.embed as Record<string, unknown> | undefined;

    // Build the customization object with changed values
    const embedOverrides: Record<string, unknown> = {};

    if ( embed ) {
        if ( embed.color !== undefined && embed.color !== originalEmbed?.color ) {
            embedOverrides.color = embed.color;
        }
        if ( embed.title !== undefined && embed.title !== originalEmbed?.title ) {
            embedOverrides.title = embed.title;
        }
        if ( embed.description !== undefined && embed.description !== originalEmbed?.description ) {
            embedOverrides.description = embed.description;
        }
    }

    // Check for variable overrides (defaultVars + options changes in embedDefinition)
    const embedDefinition = nodeData.embedDefinition as Record<string, unknown> | undefined;
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

    // Check for element overrides (label, emoji, style, disabled, url, placeholder)
    const elementRows = nodeData.elementRows as Array<Array<{ name: string; definition?: Record<string, unknown> }>> | undefined;
    const originalElementRows = originalNodeData?.elementRows as Array<Array<{ name: string; definition?: Record<string, unknown> }>> | undefined;
    const elementOverrides: Record<string, ElementOverride> = {};

    if ( elementRows ) {
        for ( let rowIdx = 0; rowIdx < elementRows.length; rowIdx++ ) {
            const row = elementRows[ rowIdx ];
            for ( let colIdx = 0; colIdx < row.length; colIdx++ ) {
                const element = row[ colIdx ];
                const originalElement = originalElementRows?.[ rowIdx ]?.[ colIdx ];
                const def = element.definition;
                const originalDef = originalElement?.definition;

                if ( !def ) continue;

                const override: ElementOverride = {};
                let hasChanges = false;

                for ( const field of ELEMENT_OVERRIDE_STRING_FIELDS ) {
                    if ( def[ field ] !== undefined && def[ field ] !== originalDef?.[ field ] ) {
                        ( override as Record<string, unknown> )[ field ] = def[ field ];
                        hasChanges = true;
                    }
                }

                if ( def.disabled !== undefined && def.disabled !== originalDef?.disabled ) {
                    override.disabled = def.disabled as boolean;
                    hasChanges = true;
                }

                // Check for selectOptions changes (label, description, emoji per option)
                const currentSelectOptions = def.selectOptions as Array<{ label?: string; value?: string; description?: string; emoji?: string }> | undefined;
                const originalSelectOptions = originalDef?.selectOptions as Array<{ label?: string; value?: string; description?: string; emoji?: string }> | undefined;

                if ( currentSelectOptions?.length ) {
                    const selectOptionOverrides: Record<string, Record<string, string>> = {};

                    for ( let optIdx = 0; optIdx < currentSelectOptions.length; optIdx++ ) {
                        const opt = currentSelectOptions[ optIdx ];
                        const originalOpt = originalSelectOptions?.[ optIdx ];
                        const optValue = opt.value ?? String( optIdx );
                        const optOverride: Record<string, string> = {};
                        let optHasChanges = false;

                        if ( opt.label !== undefined && opt.label !== originalOpt?.label ) {
                            optOverride.label = opt.label;
                            optHasChanges = true;
                        }
                        if ( opt.description !== undefined && opt.description !== originalOpt?.description ) {
                            optOverride.description = opt.description;
                            optHasChanges = true;
                        }
                        // Normalize emoji for comparison — emoji may be a string or a Discord API object
                        const normalizedEmoji = typeof opt.emoji === "string" ? opt.emoji : opt.emoji && typeof opt.emoji === "object" ? ( opt.emoji as { name?: string } ).name ?? "" : opt.emoji;
                        const normalizedOrigEmoji = typeof originalOpt?.emoji === "string" ? originalOpt.emoji : originalOpt?.emoji && typeof originalOpt.emoji === "object" ? ( originalOpt.emoji as { name?: string } ).name ?? "" : originalOpt?.emoji;

                        if ( normalizedEmoji !== undefined && normalizedEmoji !== normalizedOrigEmoji ) {
                            optOverride.emoji = typeof normalizedEmoji === "string" ? normalizedEmoji : "";
                            optHasChanges = true;
                        }

                        if ( optHasChanges ) {
                            selectOptionOverrides[ optValue ] = optOverride;
                        }
                    }

                    if ( Object.keys( selectOptionOverrides ).length > 0 ) {
                        override.selectOptions = selectOptionOverrides;
                        hasChanges = true;
                    }
                }

                if ( hasChanges ) {
                    elementOverrides[ element.name ] = override;
                }
            }
        }
    }

    const hasVariables = Object.keys( variables ).length > 0;
    const hasElementOverrides = Object.keys( elementOverrides ).length > 0;

    const customization: Record<string, unknown> = {
        embedOverrides: embedOverrides as { title?: string; description?: string; color?: number }
    };

    if ( hasVariables ) {
        customization.variables = variables;
    }

    if ( hasElementOverrides ) {
        customization.elementOverrides = elementOverrides;
    }

    return { customizationKey, customization };
}

export class SaveNodeChangesCommand extends CommandBase<FlowEditorState> {
    public static getName(): string {
        return "Dashboard/FlowEditor/SaveNodeChanges";
    }

    public async apply() {
        const { selectedNode, originalNodeData, dirtyNodes } = this.state;

        const guildId = useSelectedGuildStore.getState().selectedGuild?.id;
        if ( !guildId ) {
            logger.error( this.apply, "No guild selected" );
            return;
        }

        const selectedLanguage = useLanguageStore.getState().selectedLanguage;
        const queryModule = getQueryModule( CustomizationQuery );
        const isDefault = guildId === "__default__";

        // Collect all nodes that need saving: dirty nodes + currently selected node
        const nodesToSave: Array<{ nodeData: Record<string, unknown>; originalData: Record<string, unknown>; nodeId: string }> = [];

        // Add all stashed dirty nodes
        for ( const [ nodeId, entry ] of Object.entries( dirtyNodes ) ) {
            nodesToSave.push( {
                nodeId,
                nodeData: entry.node.data as Record<string, unknown>,
                originalData: entry.originalNodeData
            } );
        }

        // Add currently selected node if it has changes
        if ( selectedNode && originalNodeData ) {
            const currentHasChanges = computeHasChanges( selectedNode.data, this.state.lastSavedData );
            if ( currentHasChanges ) {
                nodesToSave.push( {
                    nodeId: selectedNode.id,
                    nodeData: selectedNode.data as Record<string, unknown>,
                    originalData: originalNodeData
                } );
            }
        }

        if ( nodesToSave.length === 0 ) {
            logger.debug( this.apply, "No changes to save" );
            return;
        }

        logger.debug( this.apply, `Saving ${ nodesToSave.length } node(s)`, {
            nodeIds: nodesToSave.map( n => n.nodeId )
        } );

        try {
            // Save each node's customization
            for ( const { nodeData, originalData, nodeId } of nodesToSave ) {
                const extracted = extractNodeCustomization( nodeData, originalData );

                if ( !extracted ) {
                    logger.warn( this.apply, `Skipping node ${ nodeId } — no customizationKey` );
                    continue;
                }

                const { customizationKey, customization } = extracted;

                logger.debug( this.apply, "Saving customization", { guildId, customizationKey, customization, languageCode: selectedLanguage } );

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
            }

            logger.debug( this.apply, "Save successful" );

            // Trigger refresh of customizations in FlowViewer
            const refreshFn = ( window as unknown as Record<string, () => void> ).__refreshFlowCustomization;
            if ( refreshFn ) {
                refreshFn();
            }

            // Update local state — after save, the current data becomes both the
            // original (for Restore) and the last-saved baseline (for change detection).
            const savedSnapshot = selectedNode
                ? JSON.parse( JSON.stringify( selectedNode.data ) ) as Record<string, unknown>
                : null;

            return this.setState( {
                originalNodeData: savedSnapshot,
                lastSavedData: savedSnapshot ? JSON.parse( JSON.stringify( savedSnapshot ) ) : null,
                hasUnsavedChanges: false,
                dirtyNodes: {}
            } );
        } catch( error ) {
            logger.error( this.apply, "Failed to save", error );
            return this.setState( {
                error: error instanceof Error ? error.message : "Failed to save changes"
            } );
        }
    }
}
