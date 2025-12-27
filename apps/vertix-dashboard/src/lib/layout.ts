import Dagre from "@dagrejs/dagre";

import { LAYOUT_OPTIONS, NODE_DIMENSIONS } from "@vertix.gg/dashboard/src/lib/constants";

import type { Node, Edge } from "@xyflow/react";

interface LayoutOptions {
    direction?: "TB" | "LR" | "BT" | "RL";
    nodeWidth?: number;
    nodeHeight?: number;
    rankSep?: number;
    nodeSep?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
    direction: LAYOUT_OPTIONS.DIRECTION,
    nodeWidth: 400,
    nodeHeight: 400,
    rankSep: LAYOUT_OPTIONS.RANK_SEPARATION,
    nodeSep: LAYOUT_OPTIONS.NODE_SEPARATION
};

const NODE_TYPE_DIMENSIONS: Record<string, { width: number; height: number }> = {
    moduleNode: NODE_DIMENSIONS.MODULE,
    flowNode: NODE_DIMENSIONS.FLOW,
    componentNode: NODE_DIMENSIONS.COMPONENT,
    modalNode: NODE_DIMENSIONS.MODAL
};

export function getLayoutedElements(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const nodeIndexById = new Map<string, number>();
    nodes.forEach( ( node, index ) => nodeIndexById.set( node.id, index ) );

    const adjacency = new Map<string, Set<string>>();

    nodes.forEach( ( node ) => {
        adjacency.set( node.id, new Set() );
    } );

    edges.forEach( ( edge ) => {
        const sourceSet = adjacency.get( edge.source );
        const targetSet = adjacency.get( edge.target );

        if ( !sourceSet || !targetSet ) {
            return;
        }

        sourceSet.add( edge.target );
        targetSet.add( edge.source );
    } );

    const components: string[][] = [];
    const visited = new Set<string>();

    nodes.forEach( ( node ) => {
        if ( visited.has( node.id ) ) {
            return;
        }

        const stack = [ node.id ];
        const componentIds: string[] = [];
        visited.add( node.id );

        while ( stack.length ) {
            const current = stack.pop();
            if ( !current ) {
                continue;
            }

            componentIds.push( current );

            const neighbors = adjacency.get( current );
            if ( !neighbors ) {
                continue;
            }

            neighbors.forEach( ( neighbor ) => {
                if ( visited.has( neighbor ) ) {
                    return;
                }

                visited.add( neighbor );
                stack.push( neighbor );
            } );
        }

        componentIds.sort( ( a, b ) => ( nodeIndexById.get( a ) ?? 0 ) - ( nodeIndexById.get( b ) ?? 0 ) );
        components.push( componentIds );
    } );

    const nodeByIdInput = new Map<string, Node>();
    nodes.forEach( node => nodeByIdInput.set( node.id, node ) );

    const layoutedNodesById = new Map<string, Node>();
    const componentBounds: Array<{ ids: string[]; width: number; height: number }> = [];

    components.forEach( ( componentIds ) => {
        const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel( () => ( {} ) );

        graph.setGraph( {
            rankdir: opts.direction,
            ranksep: opts.rankSep,
            nodesep: opts.nodeSep,
            ranker: "network-simplex"
        } );

        componentIds.forEach( ( id ) => {
            const node = nodeByIdInput.get( id );
            if ( !node ) {
                return;
            }

            const dimensions = NODE_TYPE_DIMENSIONS[ node.type ?? "default" ] ?? {
                width: opts.nodeWidth,
                height: opts.nodeHeight
            };

            graph.setNode( node.id, {
                width: dimensions.width,
                height: dimensions.height
            } );
        } );

        edges.forEach( ( edge ) => {
            if ( !componentIds.includes( edge.source ) || !componentIds.includes( edge.target ) ) {
                return;
            }

            graph.setEdge( edge.source, edge.target );
        } );

        Dagre.layout( graph );

        const positionedNodes = componentIds
            .map( ( id ) => {
                const node = nodeByIdInput.get( id );
                if ( !node ) {
                    return null;
                }

                const nodeWithPosition = graph.node( node.id ) as { x: number; y: number } | undefined;
                const dimensions = NODE_TYPE_DIMENSIONS[ node.type ?? "default" ] ?? {
                    width: opts.nodeWidth,
                    height: opts.nodeHeight
                };

                if ( !nodeWithPosition ) {
                    return {
                        ...node,
                        position: { x: 0, y: 0 }
                    };
                }

                return {
                    ...node,
                    position: {
                        x: nodeWithPosition.x - dimensions.width / 2,
                        y: nodeWithPosition.y - dimensions.height / 2
                    }
                };
            } )
            .filter( ( node ): node is Node => node !== null );

        const minX = positionedNodes.reduce( ( acc, node ) => Math.min( acc, node.position.x ), Number.POSITIVE_INFINITY );
        const minY = positionedNodes.reduce( ( acc, node ) => Math.min( acc, node.position.y ), Number.POSITIVE_INFINITY );
        const shiftX = Number.isFinite( minX ) ? -minX : 0;
        const shiftY = Number.isFinite( minY ) ? -minY : 0;

        const normalizedNodes = positionedNodes.map( node => ( {
            ...node,
            position: {
                x: node.position.x + shiftX,
                y: node.position.y + shiftY
            }
        } ) );

        normalizedNodes.forEach( node => layoutedNodesById.set( node.id, node ) );

        const maxX = normalizedNodes.reduce( ( acc, node ) => Math.max( acc, node.position.x + ( NODE_TYPE_DIMENSIONS[ node.type ?? "default" ]?.width ?? opts.nodeWidth ) ), 0 );
        const maxY = normalizedNodes.reduce( ( acc, node ) => Math.max( acc, node.position.y + ( NODE_TYPE_DIMENSIONS[ node.type ?? "default" ]?.height ?? opts.nodeHeight ) ), 0 );

        componentBounds.push( { ids: componentIds, width: maxX, height: maxY } );
    } );

    const totalArea = componentBounds.reduce( ( acc, b ) => acc + ( b.width * b.height ), 0 );
    const targetRowWidth = totalArea > 0 ? Math.sqrt( totalArea ) : 0;
    const gapX = opts.nodeSep;
    const gapY = opts.rankSep;

    let cursorX = 0;
    let cursorY = 0;
    let rowHeight = 0;

    componentBounds.forEach( ( bounds ) => {
        if ( cursorX > 0 && targetRowWidth > 0 && ( cursorX + bounds.width ) > targetRowWidth ) {
            cursorX = 0;
            cursorY += rowHeight + gapY;
            rowHeight = 0;
        }

        bounds.ids.forEach( ( id ) => {
            const node = layoutedNodesById.get( id );
            if ( !node ) {
                return;
            }

            layoutedNodesById.set( id, {
                ...node,
                position: {
                    x: node.position.x + cursorX,
                    y: node.position.y + cursorY
                }
            } );
        } );

        cursorX += bounds.width + gapX;
        rowHeight = Math.max( rowHeight, bounds.height );
    } );

    const layoutedNodes = nodes
        .map( ( node ) => layoutedNodesById.get( node.id ) ?? node )
        .map( node => ( { ...node } ) );

    const nodeById = new Map<string, Node>();
    layoutedNodes.forEach( node => nodeById.set( node.id, node ) );

    const nodesWithCompactedFanouts = layoutedNodes.map( node => ( { ...node } ) );
    const compactedNodeById = new Map<string, Node>();
    nodesWithCompactedFanouts.forEach( node => compactedNodeById.set( node.id, node ) );

    const fanouts = new Map<string, Set<string>>();

    edges.forEach( edge => {
        const source = edge.source;
        const target = edge.target;

        if ( !source || !target ) {
            return;
        }

        const sourceNode = nodeById.get( source );
        const targetNode = nodeById.get( target );

        if ( !sourceNode || !targetNode ) {
            return;
        }

        if ( sourceNode.type !== "componentNode" || targetNode.type !== "componentNode" ) {
            return;
        }

        const existing = fanouts.get( source ) ?? new Set<string>();
        existing.add( target );
        fanouts.set( source, existing );
    } );

    fanouts.forEach( ( targets, sourceId ) => {
        if ( targets.size < 2 ) {
            return;
        }

        const sourceNode = compactedNodeById.get( sourceId );
        if ( !sourceNode ) {
            return;
        }

        const sourceDimensions = NODE_TYPE_DIMENSIONS[ sourceNode.type ?? "default" ] ?? {
            width: opts.nodeWidth,
            height: opts.nodeHeight
        };

        const sourceCenterX = sourceNode.position.x + sourceDimensions.width / 2;

        const targetIds = [ ...targets ].filter( id => compactedNodeById.has( id ) );

        targetIds.sort( ( a, b ) => {
            const aNode = compactedNodeById.get( a );
            const bNode = compactedNodeById.get( b );
            if ( !aNode || !bNode ) {
                return 0;
            }
            return aNode.position.x - bNode.position.x;
        } );

        const firstTargetNode = compactedNodeById.get( targetIds[ 0 ] );
        const targetDimensions = firstTargetNode
            ? ( NODE_TYPE_DIMENSIONS[ firstTargetNode.type ?? "default" ] ?? { width: opts.nodeWidth, height: opts.nodeHeight } )
            : { width: opts.nodeWidth, height: opts.nodeHeight };

        const spacing = targetDimensions.width + Math.floor( opts.nodeSep * 0.5 );
        const middle = ( targetIds.length - 1 ) / 2;

        targetIds.forEach( ( targetId, index ) => {
            const targetNode = compactedNodeById.get( targetId );
            if ( !targetNode ) {
                return;
            }

            const centerX = sourceCenterX + ( index - middle ) * spacing;
            targetNode.position = {
                x: centerX - targetDimensions.width / 2,
                y: targetNode.position.y
            };
        } );
    } );

    return { nodes: nodesWithCompactedFanouts, edges };
}

