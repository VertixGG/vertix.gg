import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { nodeTypes } from "@vertix.gg/dashboard/src/components/flow-nodes";
import { getLayoutedElements } from "@vertix.gg/dashboard/src/lib/layout";
import { buildFlowGraph } from "@vertix.gg/dashboard/src/lib/graph-builder";
import { LAYOUT_OPTIONS, VIEWPORT_CONFIG, MINIMAP_COLORS, BACKGROUND_CONFIG, NODE_DIMENSIONS } from "@vertix.gg/dashboard/src/lib/constants";

import type { Viewport, Node, ReactFlowInstance } from "@xyflow/react";
import type { ModuleFlowsResponse } from "@vertix.gg/dashboard/src/lib/api-client";

interface FlowViewerProps {
    moduleFlowsData: ModuleFlowsResponse | null;
    isLoading: boolean;
    selectedNodeId: string | null;
    centerOnSelect?: boolean;
    onNodeSelect?: ( node: Node | null ) => void;
}

export function FlowViewer( props: FlowViewerProps ) {
    const { moduleFlowsData, isLoading, selectedNodeId, centerOnSelect, onNodeSelect } = props;

    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>( null );
    const [ zoom, setZoom ] = useState<number>( VIEWPORT_CONFIG.DEFAULT_ZOOM );

    const handleMove = useCallback( ( _event: MouseEvent | TouchEvent | null, viewport: Viewport ) => {
        setZoom( viewport.zoom );
    }, [] );

    const { initialNodes, initialEdges } = useMemo( () => {
        if ( !moduleFlowsData ) {
            return { initialNodes: [], initialEdges: [] };
        }

        const { nodes, edges } = buildFlowGraph( moduleFlowsData );

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            {
                direction: LAYOUT_OPTIONS.DIRECTION,
                rankSep: LAYOUT_OPTIONS.RANK_SEPARATION,
                nodeSep: LAYOUT_OPTIONS.NODE_SEPARATION
            }
        );

        return { initialNodes: layoutedNodes, initialEdges: layoutedEdges };
    }, [
        moduleFlowsData,
        LAYOUT_OPTIONS.DIRECTION,
        LAYOUT_OPTIONS.RANK_SEPARATION,
        LAYOUT_OPTIONS.NODE_SEPARATION
    ] );

    const [ nodes, setNodes, onNodesChange ] = useNodesState( initialNodes );
    const [ edges, setEdges, onEdgesChange ] = useEdgesState( initialEdges );

    useMemo( () => {
        setNodes( initialNodes );
        setEdges( initialEdges );
    }, [ initialNodes, initialEdges, setNodes, setEdges ] );

    useEffect( () => {
        setNodes( ( currentNodes ) =>
            currentNodes.map( ( node ) => ( {
                ...node,
                selected: node.id === selectedNodeId
            } ) )
        );
    }, [ selectedNodeId, setNodes ] );

    useEffect( () => {
        if ( !selectedNodeId || !centerOnSelect ) {
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

        const dimensionsByType: Record<string, { width: number; height: number }> = {
            moduleNode: NODE_DIMENSIONS.MODULE,
            flowNode: NODE_DIMENSIONS.FLOW,
            componentNode: NODE_DIMENSIONS.COMPONENT,
            modalNode: NODE_DIMENSIONS.MODAL,
            default: { width: NODE_DIMENSIONS.FLOW.width, height: NODE_DIMENSIONS.FLOW.height }
        };

        const dimensions = dimensionsByType[ selectedNode.type ?? "default" ] ?? dimensionsByType.default;
        const targetZoom = zoom < VIEWPORT_CONFIG.CENTER_ZOOM_THRESHOLD ? VIEWPORT_CONFIG.CENTER_ZOOM_TARGET : zoom;

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
        onNodeSelect?.( node );
    }, [ onNodeSelect ] );

    const onPaneClick = useCallback( () => {
        onNodeSelect?.( null );
    }, [ onNodeSelect ] );

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
        <div className="h-full w-full relative">
            <ReactFlow
                nodes={ nodes }
                edges={ edges }
                onNodesChange={ onNodesChange }
                onEdgesChange={ onEdgesChange }
                onNodeClick={ onNodeClick }
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
