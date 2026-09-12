import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import zCore from "@zenflux/core";
import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { BUTTON_ROW_LIMITS, splitTemplate, toRowBreaks } from "@vertix.gg/utils/src/button-rows";
import { toV3ButtonIds } from "@vertix.gg/definitions/src/button-ids";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import { useEditMode } from "@vertix.gg/dashboard/src/hooks/use-edit-mode";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";

import { useButtonCatalogue } from "@vertix.gg/dashboard/src/features/generators/components/buttons-picker";
import { useEditorGenerator } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-generator";
import { useEditorScopeStore } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-scope";
import { useButtonArrangementStore } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-button-arrangement-store";
import { arrangeElementRows, buttonIdsOf } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-arranged-element-rows";
import { dynamicChannelFlowFor } from "@vertix.gg/dashboard/src/features/flow-editor/lib/editor-link";

import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";

import { nodeTypes } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-nodes";
import { NodeContextMenu } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-nodes/node-context-menu";
import { getLayoutedElements } from "@vertix.gg/dashboard/src/features/flow-editor/lib/layout";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/features/flow-editor/lib/graph-builder";
import { LAYOUT_OPTIONS, VIEWPORT_CONFIG, MINIMAP_COLORS, BACKGROUND_CONFIG, NODE_DIMENSIONS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";
import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";

import { resolveCustomization } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

import type { SchemaElement } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-arranged-element-rows";

import type { CustomizationData } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

import type { Viewport, Node, Edge, ReactFlowInstance } from "@xyflow/react";
import type { FlowEditorState } from "@vertix.gg/dashboard/src/features/flow-editor/commands/flow-editor-commands";

const logger = zCore.modules.createLogger( "flow-viewer" );

interface FlowViewerSelectedState {
    moduleFlowsData: FlowEditorState[ "moduleFlowsData" ];
    isLoading: FlowEditorState[ "isLoading" ];
    selectedNode: FlowEditorState[ "selectedNode" ];
    centerOnSelect: FlowEditorState[ "centerOnSelect" ];
}

export function FlowViewer() {
    const [ state ] = useCommandState<FlowEditorState, FlowViewerSelectedState>(
        "Dashboard/FlowEditor",
        ( state: FlowEditorState ): FlowViewerSelectedState => ( {
            moduleFlowsData: state.moduleFlowsData,
            isLoading: state.isLoading,
            selectedNode: state.selectedNode,
            centerOnSelect: state.centerOnSelect
        } )
    );

    const selectNode = useCommand( "Dashboard/FlowEditor/SelectNode" );
    const { isEditMode, editingFlowName, enterEditMode, exitEditMode } = useEditMode();
    const guildId = useSelectedGuildId();
    const selectedLanguage = useLanguageStore( ( state ) => state.selectedLanguage );
    const translations = useLanguageStore( ( state ) => state.translations );

    // Which generator the preview is resolving as. Null draws what every generator of this version
    // shows; naming one draws that generator's own wording on top.
    const scopeMasterChannelId = useEditorScopeStore( ( state ) => state.masterChannelId );

    // Load customizations for the guild
    const [ customization, setCustomization ] = useState<CustomizationData | null>( null );
    const [ customizationRefreshKey, setCustomizationRefreshKey ] = useState( 0 );

    // Expose a refresh function globally for the save command to call
    useEffect( () => {
        ( window as unknown as Record<string, unknown> ).__refreshFlowCustomization = () => {
            setCustomizationRefreshKey( k => k + 1 );
        };

        return () => {
            delete ( window as unknown as Record<string, unknown> ).__refreshFlowCustomization;
        };
    }, [] );

    useEffect( () => {
        if ( !guildId ) {
            setCustomization( null );
            return;
        }

        // Fetch customizations when guild changes or when refresh is triggered
        const queryModule = getQueryModule( CustomizationQuery );
        const isDefault = guildId === DEFAULT_CUSTOMIZATION_GUILD_ID;
        queryModule.request<CustomizationData>(
            isDefault ? "Dashboard/Customization/GetDefault" : "Dashboard/Customization/GetGuild",
            isDefault ? {} : { guildId }
        )
            .then( ( data ) => {
                logger.debug( FlowViewer, "Loaded customizations for guild", data );
                setCustomization( data );
            } )
            .catch( ( error ) => {
                logger.error( FlowViewer, "Failed to load customizations", error );
                setCustomization( null );
            } );
    }, [ guildId, customizationRefreshKey ] );

    const handleNodeSelect = ( node: Node | null ) => {
        selectNode.run( { node, centerOnSelect: false } );
    };

    const { moduleFlowsData, isLoading, selectedNode, centerOnSelect } = state;
    const selectedNodeId = selectedNode?.id ?? null;

    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>( null );
    const lastCenteredNodeRef = useRef<string | null>( null );
    const [ zoom, setZoom ] = useState<number>( VIEWPORT_CONFIG.DEFAULT_ZOOM );
    const [ contextMenu, setContextMenu ] = useState<{ x: number; y: number; flowName: string } | null>( null );

    const handleMove = useCallback( ( _event: MouseEvent | TouchEvent | null, viewport: Viewport ) => {
        setZoom( viewport.zoom );
        setContextMenu( null );
    }, [] );

    // Step 1: Layout — only recompute when structure changes (module, edit mode)
    // What the preview should draw: this generator's own set, in the rows it prints them in,
    // including an arrangement still being dragged and not yet saved.
    const { selected: generator } = useEditorGenerator();
    const { catalogue } = useButtonCatalogue( generator?.version );
    const arrangementDraft = useButtonArrangementStore( ( state ) => state.draft );

    // The component a generator's channels are drawn by, which is named per interface version. A v2
    // generator matched against v3's name found nothing, so its set was never arranged and the
    // editor never landed on the component the link from its settings was about.
    const dynamicChannelComponent = dynamicChannelFlowFor( generator?.version ).COMPONENT;

    const { layoutedNodes, layoutedEdges } = useMemo( () => {
        if ( !moduleFlowsData ) {
            return { layoutedNodes: [] as Node[], layoutedEdges: [] as Edge[] };
        }

        const { nodes: allNodes, edges: allEdges } = buildFlowGraph( moduleFlowsData );

        // Filter nodes and edges when in edit mode
        let nodesToLayout = allNodes;
        let edgesToLayout = allEdges;

        if ( isEditMode && editingFlowName ) {
            const filteredNodes = allNodes.filter( ( node ) => {
                const nodeFlowName = node.data?.flowName as string | undefined;
                return nodeFlowName === editingFlowName;
            } );

            const filteredNodeIds = new Set( filteredNodes.map( n => n.id ) );

            const filteredEdges = allEdges.filter( ( edge ) => {
                return filteredNodeIds.has( edge.source ) && filteredNodeIds.has( edge.target );
            } );

            nodesToLayout = filteredNodes;
            edgesToLayout = filteredEdges;
        }

        const { nodes: laid, edges: laidEdges } = getLayoutedElements(
            nodesToLayout,
            edgesToLayout,
            {
                direction: LAYOUT_OPTIONS.DIRECTION,
                rankSep: LAYOUT_OPTIONS.RANK_SEPARATION,
                nodeSep: LAYOUT_OPTIONS.NODE_SEPARATION
            }
        );

        return { layoutedNodes: laid, layoutedEdges: laidEdges };
    }, [
        moduleFlowsData,
        isEditMode,
        editingFlowName,
        LAYOUT_OPTIONS.DIRECTION,
        LAYOUT_OPTIONS.RANK_SEPARATION,
        LAYOUT_OPTIONS.NODE_SEPARATION
    ] );

    // Step 2: Content — apply translations + customizations without re-layout
    const { initialNodes, initialEdges } = useMemo( () => {
        const contentNodes = layoutedNodes.map( ( node ) => {
            const nodeType = node.data?.type as string | undefined;

            // Skip nodes that are not editable (module, flow, state)
            if ( nodeType !== "component" && nodeType !== "modal" ) {
                return node;
            }

            let updatedData = { ...node.data };

            // Apply language translations
            if ( translations ) {
                const embedName = node.data?.embedName as string | undefined;
                const embed = node.data?.embed as Record<string, unknown> | undefined;

                if ( embed && embedName ) {
                    const embedTranslation = translations.embeds[ embedName ];

                    if ( embedTranslation ) {
                        const updatedEmbed = { ...embed };
                        if ( embedTranslation.title !== undefined ) {
                            updatedEmbed.title = embedTranslation.title;
                        }
                        if ( embedTranslation.description !== undefined ) {
                            updatedEmbed.description = embedTranslation.description;
                        }
                        updatedData = { ...updatedData, embed: updatedEmbed };
                    }
                }

                // Translate element labels
                const elementRows = node.data?.elementRows as Array<Array<{ name: string; definition?: { label?: string; elementType?: string } }>> | undefined;
                if ( elementRows && translations.elements ) {
                    const updatedElementRows = elementRows.map( ( row ) =>
                        row.map( ( el ) => {
                            const elTranslation = translations.elements[ el.name ];
                            if ( elTranslation?.label && el.definition ) {
                                return { ...el, definition: { ...el.definition, label: elTranslation.label } };
                            }
                            return el;
                        } )
                    );
                    updatedData = { ...updatedData, elementRows: updatedElementRows };
                }
            }

            // Apply customization overrides on top
            const component = node.data?.component as string | undefined;
            if ( component && customization ) {
                const componentCustomization = resolveCustomization( customization, {
                    component,
                    state: ( node.data?.state as string | null ) ?? null,
                    language: selectedLanguage,
                    masterChannelId: scopeMasterChannelId
                } );

                if ( componentCustomization?.embedOverrides ) {
                    const currentEmbed = ( updatedData.embed ?? node.data?.embed ) as Record<string, unknown> | undefined;
                    if ( currentEmbed ) {
                        const updatedEmbed = { ...currentEmbed };
                        const { color, title, description } = componentCustomization.embedOverrides;
                        if ( color !== undefined ) updatedEmbed.color = color;
                        if ( title !== undefined ) updatedEmbed.title = title;
                        if ( description !== undefined ) updatedEmbed.description = description;
                        updatedData = { ...updatedData, embed: updatedEmbed };
                    }
                }

                // Apply saved variable overrides to embed.defaultVars so the preview reflects them
                if ( componentCustomization?.variables ) {
                    const currentEmbed = ( updatedData.embed ?? node.data?.embed ) as Record<string, unknown> | undefined;
                    if ( currentEmbed ) {
                        const currentDefaultVars = ( currentEmbed.defaultVars ?? {} ) as Record<string, unknown>;
                        const updatedDefaultVars = { ...currentDefaultVars };

                        for ( const [ key, value ] of Object.entries( componentCustomization.variables ) ) {
                            if ( !key.startsWith( "__option__" ) ) {
                                updatedDefaultVars[ key ] = value;
                            }
                        }

                        updatedData = { ...updatedData, embed: { ...currentEmbed, defaultVars: updatedDefaultVars } };
                    }
                }

                // Apply saved element overrides to elementRows so the preview reflects them
                if ( componentCustomization?.elementOverrides ) {
                    const currentElementRows = ( updatedData.elementRows ?? node.data?.elementRows ) as Array<Array<{ name: string; definition?: Record<string, unknown> }>> | undefined;
                    if ( currentElementRows ) {
                        const updatedElementRows = currentElementRows.map( ( row ) =>
                            row.map( ( el ) => {
                                const override = ( componentCustomization.elementOverrides as Record<string, Record<string, unknown>> )[ el.name ];
                                if ( override && el.definition ) {
                                    const updatedDef = { ...el.definition };
                                    for ( const [ field, value ] of Object.entries( override ) ) {
                                        if ( field === "selectOptions" && typeof value === "object" && value !== null ) {
                                            // Merge selectOption overrides into existing selectOptions array
                                            const existingOptions = ( updatedDef.selectOptions ?? [] ) as Array<{ value?: string; label?: string; description?: string; emoji?: string }>;
                                            const optOverrides = value as Record<string, Record<string, string>>;
                                            updatedDef.selectOptions = existingOptions.map( ( opt, idx ) => {
                                                const optValue = opt.value ?? String( idx );
                                                const optOverride = optOverrides[ optValue ];
                                                return optOverride ? { ...opt, ...optOverride } : opt;
                                            } );
                                        } else {
                                            updatedDef[ field ] = value;
                                        }
                                    }
                                    return { ...el, definition: updatedDef };
                                }
                                return el;
                            } )
                        );
                        updatedData = { ...updatedData, elementRows: updatedElementRows };
                    }
                }

                // Apply saved modal overrides (title + per-input label/placeholder)
                const currentNodeType = node.data?.type as string | undefined;
                if ( currentNodeType === "modal" && componentCustomization?.modalOverrides ) {
                    const modalOvr = componentCustomization.modalOverrides as {
                        title?: string;
                        inputOverrides?: Record<string, { label?: string; placeholder?: string }>;
                    };

                    if ( modalOvr.title !== undefined ) {
                        updatedData = { ...updatedData, title: modalOvr.title };
                    }

                    if ( modalOvr.inputOverrides ) {
                        const currentInputs = ( updatedData.inputs ?? node.data?.inputs ) as Array<{ name: string; label?: string; placeholder?: string }> | undefined;
                        if ( currentInputs ) {
                            const updatedInputs = currentInputs.map( ( input ) => {
                                const override = modalOvr.inputOverrides![ input.name ];
                                if ( !override ) return input;
                                return {
                                    ...input,
                                    ...( override.label !== undefined ? { label: override.label } : {} ),
                                    ...( override.placeholder !== undefined ? { placeholder: override.placeholder } : {} )
                                };
                            } );
                            updatedData = { ...updatedData, inputs: updatedInputs };
                        }
                    }
                }
            }

            // Last, so it arranges the elements as they will finally read - after their labels are
            // translated and their overrides applied. Only the component a generator's channels are
            // drawn by, and only once a generator is picked; otherwise the schema's rows stand.
            if ( dynamicChannelComponent === node.data?.component && generator ) {
                const currentElementRows =
                    ( updatedData.elementRows ?? node.data?.elementRows ) as SchemaElement[][] | undefined;

                const stored = splitTemplate( generator.settings?.dynamicChannelButtonsTemplate ?? [] );

                const arranged = currentElementRows && arrangeElementRows( {
                    schemaRows: currentElementRows,
                    catalogue,
                    // Both catalogues are keyed by the v3 slug, so a v2 generator's stored numbers
                    // are read into that vocabulary first - left raw they matched no element and
                    // the arrangement fell back to the schema's own rows.
                    template: toV3ButtonIds( stored.ids ),
                    rowBreaks: stored.rowBreaks,
                    draftNames: arrangementDraft
                } );

                if ( arranged ) {
                    // A field of its own: `elementRows` is what the edit sidebar reads as the
                    // component's full set, and overwriting it with the arranged subset would
                    // shrink that set on every pass - the arrangement eating its own source.
                    updatedData = { ...updatedData, previewElementRows: arranged };

                    // The legend above the buttons is an image the embed already asks for, by a url
                    // carrying `{dynamicChannelButtonsTemplate}` and `{dynamicChannelButtonsRowBreaks}`
                    // - so this supplies those two and leaves the picture to the embed.
                    //
                    // Building the url here instead meant a second place deciding what the sheet
                    // looks like, and it was drawn for every version: v2 has no legend at all, it
                    // sets a blank spacer there, and the override replaced that with v3's sheet.
                    const currentEmbed = ( updatedData.embed ?? node.data?.embed ) as
                        Record<string, unknown> | undefined;

                    if ( currentEmbed ) {
                        const ids = arranged.map( ( row ) => buttonIdsOf( [ row ], catalogue ) ),
                            items = ids.flat().join( "," ),
                            breaks = toRowBreaks( ids, BUTTON_ROW_LIMITS.MAX_PER_ROW ).join( "," );

                        const defaultVars =
                            ( currentEmbed.defaultVars ?? {} ) as Record<string, string>;

                        updatedData = {
                            ...updatedData,
                            embed: {
                                ...currentEmbed,
                                defaultVars: {
                                    ...defaultVars,
                                    dynamicChannelButtonsTemplate: items,
                                    dynamicChannelButtonsRowBreaks: breaks
                                }
                            }
                        };
                    }
                }
            }

            return updatedData !== node.data ? { ...node, data: updatedData } : node;
        } );

        return { initialNodes: contentNodes, initialEdges: layoutedEdges };
    }, [
        layoutedNodes,
        layoutedEdges,
        translations,
        customization,
        selectedLanguage,
        scopeMasterChannelId,
        generator,
        catalogue,
        arrangementDraft,
        dynamicChannelComponent
    ] );

    const [ nodes, setNodes, onNodesChange ] = useNodesState( initialNodes );
    const [ edges, setEdges, onEdgesChange ] = useEdgesState( initialEdges );

    // Track the last layout reference to distinguish structural vs content-only changes
    const prevLayoutRef = useRef( layoutedNodes );

    useEffect( () => {
        const isStructuralChange = prevLayoutRef.current !== layoutedNodes;
        prevLayoutRef.current = layoutedNodes;

        if ( isStructuralChange ) {
            // Layout changed — replace all nodes + edges and fit the view
            setNodes( initialNodes );
            setEdges( initialEdges );

            const reactFlowInstance = reactFlowInstanceRef.current;
            if ( reactFlowInstance && initialNodes.length > 0 ) {
                setTimeout( () => {
                    reactFlowInstance.fitView( { padding: 0.2, duration: 300 } );
                }, 50 );
            }
        } else {
            // Content-only change (language / customization) — update data in-place, keep positions
            setNodes( ( currentNodes ) =>
                currentNodes.map( ( currentNode ) => {
                    const updated = initialNodes.find( n => n.id === currentNode.id );
                    if ( updated && updated.data !== currentNode.data ) {
                        return { ...currentNode, data: updated.data };
                    }
                    return currentNode;
                } )
            );
        }
    }, [ initialNodes, initialEdges, layoutedNodes, setNodes, setEdges ] );

    useEffect( () => {
        setNodes( ( currentNodes ) =>
            currentNodes.map( ( node ) => ( {
                ...node,
                selected: node.id === selectedNodeId
            } ) )
        );
    }, [ selectedNodeId, setNodes ] );

    // Arriving from a generator's settings means the admin came here to edit that flow's buttons,
    // so the component is opened for them rather than left behind a "click a component" prompt.
    const openedForGenerator = Boolean( generator );
    const autoSelectedRef = useRef( false );

    useEffect( () => {
        if ( autoSelectedRef.current || ! openedForGenerator || selectedNodeId ) {
            return;
        }

        const component = nodes.find(
            ( node ) => dynamicChannelComponent === ( node.data as { component?: string } )?.component );

        if ( component ) {
            autoSelectedRef.current = true;
            selectNode.run( { node: component, centerOnSelect: true } );
        }
    }, [ nodes, openedForGenerator, selectedNodeId, selectNode, dynamicChannelComponent ] );

    // Sync selectedNode data changes back to the nodes array
    useEffect( () => {
        if ( !selectedNode ) {
            return;
        }

        setNodes( ( currentNodes ) =>
            currentNodes.map( ( node ) => {
                if ( node.id === selectedNode.id ) {
                    return {
                        ...node,
                        data: selectedNode.data
                    };
                }
                return node;
            } )
        );
    }, [ selectedNode, setNodes ] );

    useEffect( () => {
        if ( !selectedNodeId || !centerOnSelect ) {
            lastCenteredNodeRef.current = null;
            return;
        }

        if ( lastCenteredNodeRef.current === selectedNodeId ) {
            return;
        }

        const reactFlowInstance = reactFlowInstanceRef.current;
        if ( !reactFlowInstance ) {
            return;
        }

        const selectedNode = nodes.find( node => node.id === selectedNodeId );
        if ( !selectedNode ) {
            return;
        }

        lastCenteredNodeRef.current = selectedNodeId;

        const dimensionsByType: Record<string, { width: number; height: number }> = {
            moduleNode: NODE_DIMENSIONS.MODULE,
            flowNode: NODE_DIMENSIONS.FLOW,
            componentNode: NODE_DIMENSIONS.COMPONENT,
            modalNode: NODE_DIMENSIONS.MODAL,
            default: { width: NODE_DIMENSIONS.FLOW.width, height: NODE_DIMENSIONS.FLOW.height }
        };

        const dimensions = dimensionsByType[ selectedNode.type ?? "default" ] ?? dimensionsByType.default;
        const currentZoom = reactFlowInstance.getZoom();
        const targetZoom = currentZoom < VIEWPORT_CONFIG.CENTER_ZOOM_THRESHOLD ? VIEWPORT_CONFIG.CENTER_ZOOM_TARGET : currentZoom;

        reactFlowInstance.setCenter(
            selectedNode.position.x + dimensions.width / 2,
            selectedNode.position.y + dimensions.height / 2,
            { zoom: targetZoom, duration: VIEWPORT_CONFIG.CENTER_ANIMATION_DURATION }
        );
    }, [ nodes, selectedNodeId, centerOnSelect ] );

    const onLayout = useCallback( () => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            {
                direction: LAYOUT_OPTIONS.DIRECTION,
                rankSep: LAYOUT_OPTIONS.RANK_SEPARATION,
                nodeSep: LAYOUT_OPTIONS.NODE_SEPARATION
            }
        );
        setNodes( [ ...layoutedNodes ] );
        setEdges( [ ...layoutedEdges ] );
    }, [ nodes, edges, setNodes, setEdges ] );

    const onNodeClick = useCallback( ( _event: React.MouseEvent, node: Node ) => {
        handleNodeSelect( node );
        setContextMenu( null );
    }, [ handleNodeSelect ] );

    const onNodeDoubleClick = useCallback( ( _event: React.MouseEvent, node: Node ) => {
        handleNodeSelect( node );

        const flowName = node.data?.flowName as string | undefined;
        const nodeType = node.data?.type as string | undefined;

        if ( flowName && guildId && ( nodeType === "component" || nodeType === "modal" ) ) {
            enterEditMode( flowName, guildId );
        }
    }, [ handleNodeSelect, guildId, enterEditMode ] );

    const onPaneClick = useCallback( () => {
        handleNodeSelect( null );
        setContextMenu( null );
    }, [ handleNodeSelect ] );

    const onNodeContextMenu = useCallback( ( event: React.MouseEvent, node: Node ) => {
        event.preventDefault();

        const flowName = node.data?.flowName as string | undefined;
        const nodeType = node.data?.type as string | undefined;

        if ( !flowName || ( nodeType !== "component" && nodeType !== "modal" ) ) {
            return;
        }

        handleNodeSelect( node );
        setContextMenu( { x: event.clientX, y: event.clientY, flowName } );
    }, [ handleNodeSelect ] );

    if ( isLoading ) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-900">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if ( !moduleFlowsData ) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-900">
                <div className="text-zinc-500">Select a module to view its flows and components</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative flow-viewer">
            <ReactFlow
                nodes={ nodes }
                edges={ edges }
                onNodesChange={ onNodesChange }
                onEdgesChange={ onEdgesChange }
                onNodeClick={ onNodeClick }
                onNodeDoubleClick={ onNodeDoubleClick }
                onPaneClick={ onPaneClick }
                onNodeContextMenu={ onNodeContextMenu }
                onMove={ handleMove }
                nodeTypes={ nodeTypes }
                onInit={ ( instance ) => {
                    reactFlowInstanceRef.current = instance;
                } }
                fitView
                minZoom={ VIEWPORT_CONFIG.MIN_ZOOM }
                maxZoom={ VIEWPORT_CONFIG.MAX_ZOOM }
                defaultViewport={ { ...VIEWPORT_CONFIG.DEFAULT_POSITION, zoom: VIEWPORT_CONFIG.DEFAULT_ZOOM } }
            >
                <Background color={ BACKGROUND_CONFIG.COLOR } gap={ BACKGROUND_CONFIG.GAP } />
                <Controls className="bg-zinc-800! border-zinc-700! [&>button]:bg-zinc-800! [&>button]:border-zinc-700! [&>button]:text-white!" />
                <MiniMap
                    style={ { background: MINIMAP_COLORS.BACKGROUND } }
                    nodeColor={ ( node ) => {
                        const type = node.data?.type;
                        if ( type === "module" ) return MINIMAP_COLORS.MODULE;
                        if ( type === "flow" ) {
                            return node.data?.isSystemFlow ? MINIMAP_COLORS.SYSTEM_FLOW : MINIMAP_COLORS.FLOW;
                        }
                        if ( type === "component" ) return MINIMAP_COLORS.COMPONENT;
                        if ( type === "modal" ) return MINIMAP_COLORS.MODAL;
                        return MINIMAP_COLORS.MODULE;
                    } }
                    maskColor={ MINIMAP_COLORS.MASK }
                />
            </ReactFlow>

            <div className="absolute bottom-4 right-4 mb-[120px] px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300">
                { Math.round( zoom * 100 ) }%
            </div>

            <div className="absolute top-4 left-4">
                { isEditMode && editingFlowName ? (
                    <button
                        onClick={ () => exitEditMode() }
                        className="px-3 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-blue-200 text-sm rounded border border-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                        title="Exit edit mode"
                    >
                        <span>Editing: { editingFlowName.split( "/" ).pop() }</span>
                        <span className="text-blue-400 hover:text-white text-xs font-bold">✕</span>
                    </button>
                ) : ( () => {
                    const nodeType = selectedNode?.data?.type as string | undefined;
                    const nodeFlowName = selectedNode?.data?.flowName as string | undefined;
                    if ( nodeFlowName && guildId && ( nodeType === "component" || nodeType === "modal" ) ) {
                        return (
                            <button
                                onClick={ () => enterEditMode( nodeFlowName, guildId ) }
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded border border-blue-500 transition-colors cursor-pointer"
                            >
                                Edit
                            </button>
                        );
                    }
                    return null;
                } )() }
            </div>

            <div className="absolute top-4 right-4">
                <button
                    onClick={ onLayout }
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded border border-zinc-600 transition-colors"
                >
                    Auto Layout
                </button>
            </div>

            { contextMenu && guildId && (
                <NodeContextMenu
                    x={ contextMenu.x }
                    y={ contextMenu.y }
                    flowName={ contextMenu.flowName }
                    onEdit={ () => {
                        enterEditMode( contextMenu.flowName, guildId );
                    } }
                    onClose={ () => setContextMenu( null ) }
                />
            ) }
        </div>
    );
}
