import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import zCore from "@zenflux/core";
import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";
import { getQueryModule } from "@zenflux/react-commander/query/provider";

import { useEditMode } from "@vertix.gg/dashboard/src/hooks/use-edit-mode";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";
import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";

import { nodeTypes } from "@vertix.gg/dashboard/src/features/flow-editor/components/flow-nodes";
import { getLayoutedElements } from "@vertix.gg/dashboard/src/features/flow-editor/lib/layout";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/features/flow-editor/lib/graph-builder";
import { LAYOUT_OPTIONS, VIEWPORT_CONFIG, MINIMAP_COLORS, BACKGROUND_CONFIG, NODE_DIMENSIONS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";
import { CustomizationQuery } from "@vertix.gg/dashboard/src/features/flow-editor/query/customization-query";

import type { GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

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

    // Load customizations for the guild
    const [ customization, setCustomization ] = useState<GuildCustomizationData | null>( null );
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
        const isDefault = guildId === "__default__";
        queryModule.request<GuildCustomizationData>(
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

    const handleMove = useCallback( ( _event: MouseEvent | TouchEvent | null, viewport: Viewport ) => {
        setZoom( viewport.zoom );
    }, [] );

    // Step 1: Layout — only recompute when structure changes (module, edit mode)
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
            if ( node.data?.type !== "component" ) {
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
            const customizationKey = node.data?.customizationKey as string | undefined;
            if ( customizationKey && customization?.components ) {
                const langKey = `${ customizationKey }::${ selectedLanguage }`;
                const componentCustomization = customization.components[ langKey ] ?? customization.components[ customizationKey ];

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
            }

            return updatedData !== node.data ? { ...node, data: updatedData } : node;
        } );

        return { initialNodes: contentNodes, initialEdges: layoutedEdges };
    }, [ layoutedNodes, layoutedEdges, translations, customization, selectedLanguage ] );

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
    }, [ handleNodeSelect ] );

    const onNodeDoubleClick = useCallback( ( _event: React.MouseEvent, node: Node ) => {
        handleNodeSelect( node );
    }, [ handleNodeSelect ] );

    const onPaneClick = useCallback( () => {
        handleNodeSelect( null );
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

            <div className="absolute top-4 right-4 flex gap-2">
                { isEditMode && editingFlowName && (
                    <div className="px-3 py-2 bg-blue-900/50 text-blue-200 text-sm rounded border border-blue-700">
                        Editing: { editingFlowName.split( "/" ).pop() }
                    </div>
                ) }
                <button
                    onClick={ () => {
                        if ( isEditMode ) {
                            exitEditMode();
                        } else if ( selectedNode && guildId ) {
                            const flowName = selectedNode.data?.flowName as string | undefined;
                            if ( flowName ) {
                                enterEditMode( flowName, guildId );
                            }
                        }
                    } }
                    disabled={ !isEditMode && ( !selectedNode || !guildId ) }
                    className={ `px-3 py-2 text-white text-sm rounded border transition-colors ${
                        isEditMode
                            ? "bg-blue-600 hover:bg-blue-700 border-blue-500"
                            : selectedNode
                                ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-600"
                                : "bg-zinc-800/50 border-zinc-700 cursor-not-allowed opacity-50"
                    }` }
                >
                    { isEditMode ? "Exit Edit Mode" : "Edit Mode" }
                </button>
                <button
                    onClick={ onLayout }
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded border border-zinc-600 transition-colors"
                >
                    Auto Layout
                </button>
            </div>
        </div>
    );
}
