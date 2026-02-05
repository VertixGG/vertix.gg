import Dagre from "@dagrejs/dagre";

import { LAYOUT_OPTIONS, NODE_DIMENSIONS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";

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

function getNodeDimensions( node: Node, opts: Required<LayoutOptions> ): { width: number; height: number } {
    return NODE_TYPE_DIMENSIONS[ node.type ?? "default" ] ?? {
        width: opts.nodeWidth,
        height: opts.nodeHeight
    };
}

/**
 * Partition nodes into main nodes (for Dagre layout) and satellite modals (positioned relative to parent).
 * A modal is a "satellite" only if all its incoming edges come from componentNode or modalNode sources.
 * Modal-first entry modals (connected from flowNodes) remain in the main layout.
 */
function partitionNodes(
    nodes: Node[],
    edges: Edge[]
): {
    mainNodes: Node[];
    satelliteModals: Node[];
    mainEdges: Edge[];
    parentToModalIds: Map<string, string[]>;
} {
    const nodeById = new Map( nodes.map( n => [ n.id, n ] ) );
    const modalNodes = nodes.filter( n => n.type === "modalNode" );

    // Determine which modals are satellites (connected only from component/modal nodes)
    const satelliteModalIds = new Set<string>();

    modalNodes.forEach( modal => {
        const incomingEdges = edges.filter( e => e.target === modal.id );

        if ( incomingEdges.length === 0 ) {
            // Orphan modal with no incoming edges — treat as satellite so it doesn't float alone in Dagre
            satelliteModalIds.add( modal.id );
            return;
        }

        const allFromComponentOrModal = incomingEdges.every( e => {
            const sourceNode = nodeById.get( e.source );
            return sourceNode?.type === "componentNode" || sourceNode?.type === "modalNode";
        } );

        if ( allFromComponentOrModal ) {
            satelliteModalIds.add( modal.id );
        }
    } );

    const mainNodes = nodes.filter( n => !satelliteModalIds.has( n.id ) );
    const satelliteModals = nodes.filter( n => satelliteModalIds.has( n.id ) );

    // Main edges: exclude edges where either end is a satellite modal
    const mainEdges = edges.filter( e =>
        !satelliteModalIds.has( e.source ) && !satelliteModalIds.has( e.target )
    );

    // Build parent-to-modals map: component/modal → list of satellite modal children
    const parentToModalIds = new Map<string, string[]>();

    edges.forEach( edge => {
        if ( satelliteModalIds.has( edge.target ) ) {
            const existing = parentToModalIds.get( edge.source ) ?? [];
            existing.push( edge.target );
            parentToModalIds.set( edge.source, existing );
        }
    } );

    return { mainNodes, satelliteModals, mainEdges, parentToModalIds };
}

/**
 * Position satellite modal nodes relative to their parent component.
 * Modals are placed to the left of their parent, stacked vertically and centered.
 */
function positionSatelliteModals(
    layoutedNodesById: Map<string, Node>,
    satelliteModals: Node[],
    parentToModalIds: Map<string, string[]>,
    opts: Required<LayoutOptions>
): void {
    const modalGap = LAYOUT_OPTIONS.MODAL_GAP;
    const modalStackGap = LAYOUT_OPTIONS.MODAL_STACK_GAP;
    const modalNodeById = new Map( satelliteModals.map( n => [ n.id, n ] ) );

    parentToModalIds.forEach( ( modalIds, parentId ) => {
        const parentNode = layoutedNodesById.get( parentId );
        if ( !parentNode ) {
            return;
        }

        const parentDims = getNodeDimensions( parentNode, opts );

        // Calculate total height of modal stack
        const modalDimsList = modalIds.map( id => {
            const modal = modalNodeById.get( id );
            return modal ? getNodeDimensions( modal, opts ) : { width: 0, height: 0 };
        } );

        const totalModalHeight = modalDimsList.reduce( ( acc, dims, idx ) => {
            return acc + dims.height + ( idx > 0 ? modalStackGap : 0 );
        }, 0 );

        // Center the modal stack vertically against the parent
        const parentCenterY = parentNode.position.y + parentDims.height / 2;
        let currentY = parentCenterY - totalModalHeight / 2;

        modalIds.forEach( ( modalId, idx ) => {
            const modalNode = modalNodeById.get( modalId );
            if ( !modalNode ) {
                return;
            }

            const modalDims = modalDimsList[ idx ];

            // Place to the left of parent
            const modalX = parentNode.position.x - modalDims.width - modalGap;

            layoutedNodesById.set( modalId, {
                ...modalNode,
                position: {
                    x: modalX,
                    y: currentY
                }
            } );

            currentY += modalDims.height + modalStackGap;
        } );
    } );

    // Handle orphan satellite modals that have no parent in the map
    satelliteModals.forEach( modal => {
        if ( layoutedNodesById.has( modal.id ) ) {
            return;
        }

        // Place at origin as fallback
        layoutedNodesById.set( modal.id, {
            ...modal,
            position: { x: 0, y: 0 }
        } );
    } );
}

/**
 * Resolve overlaps between satellite modals and main nodes.
 * If a modal overlaps a main node, move it to the right side of its parent instead.
 */
function resolveModalOverlaps(
    layoutedNodesById: Map<string, Node>,
    satelliteModals: Node[],
    parentToModalIds: Map<string, string[]>,
    mainNodes: Node[],
    opts: Required<LayoutOptions>
): void {
    const modalGap = LAYOUT_OPTIONS.MODAL_GAP;

    // Collect bounding boxes of all main nodes
    const mainBounds = mainNodes.map( n => {
        const node = layoutedNodesById.get( n.id );
        if ( !node ) {
            return null;
        }
        const dims = getNodeDimensions( node, opts );
        return {
            id: n.id,
            left: node.position.x,
            right: node.position.x + dims.width,
            top: node.position.y,
            bottom: node.position.y + dims.height
        };
    } ).filter( ( b ): b is NonNullable<typeof b> => b !== null );

    const hasOverlap = ( modalId: string ): boolean => {
        const modal = layoutedNodesById.get( modalId );
        if ( !modal ) {
            return false;
        }
        const dims = getNodeDimensions( modal, opts );
        const mLeft = modal.position.x;
        const mRight = modal.position.x + dims.width;
        const mTop = modal.position.y;
        const mBottom = modal.position.y + dims.height;

        return mainBounds.some( b =>
            !( mRight < b.left || mLeft > b.right || mBottom < b.top || mTop > b.bottom )
        );
    };

    // For each parent's modals, if any overlap a main node, move the entire stack to the right
    parentToModalIds.forEach( ( modalIds, parentId ) => {
        const anyOverlap = modalIds.some( id => hasOverlap( id ) );
        if ( !anyOverlap ) {
            return;
        }

        const parentNode = layoutedNodesById.get( parentId );
        if ( !parentNode ) {
            return;
        }

        const parentDims = getNodeDimensions( parentNode, opts );

        // Move all modals in this group to the right side
        modalIds.forEach( modalId => {
            const modal = layoutedNodesById.get( modalId );
            if ( !modal ) {
                return;
            }

            // Shift x from left-of-parent to right-of-parent
            const newX = parentNode.position.x + parentDims.width + modalGap;

            layoutedNodesById.set( modalId, {
                ...modal,
                position: {
                    x: newX,
                    y: modal.position.y
                }
            } );
        } );
    } );
}

export function getLayoutedElements(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // --- Phase 0: Partition nodes into main (Dagre) and satellite modals ---
    const { mainNodes, satelliteModals, mainEdges, parentToModalIds } = partitionNodes( nodes, edges );

    const nodeIndexById = new Map<string, number>();
    nodes.forEach( ( node, index ) => nodeIndexById.set( node.id, index ) );

    // --- Phase 1: Connected component detection (main nodes only) ---
    const adjacency = new Map<string, Set<string>>();

    mainNodes.forEach( ( node ) => {
        adjacency.set( node.id, new Set() );
    } );

    mainEdges.forEach( ( edge ) => {
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

    mainNodes.forEach( ( node ) => {
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

    // --- Phase 2: Dagre layout per connected component (main nodes only) ---
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

            const dimensions = getNodeDimensions( node, opts );

            graph.setNode( node.id, {
                width: dimensions.width,
                height: dimensions.height
            } );
        } );

        mainEdges.forEach( ( edge ) => {
            if ( !componentIds.includes( edge.source ) || !componentIds.includes( edge.target ) ) {
                return;
            }

            const edgeData = edge.data as { isBackEdge?: boolean; weight?: number } | undefined;
            if ( edgeData?.isBackEdge ) {
                return;
            }

            if ( edge.source === edge.target ) {
                return;
            }

            const weight = edgeData?.weight ?? 1;
            graph.setEdge( edge.source, edge.target, { weight } );
        } );

        Dagre.layout( graph );

        const positionedNodes = componentIds
            .map( ( id ) => {
                const node = nodeByIdInput.get( id );
                if ( !node ) {
                    return null;
                }

                const nodeWithPosition = graph.node( node.id ) as { x: number; y: number } | undefined;
                const dimensions = getNodeDimensions( node, opts );

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

        const maxX = normalizedNodes.reduce( ( acc, node ) => Math.max( acc, node.position.x + getNodeDimensions( node, opts ).width ), 0 );
        const maxY = normalizedNodes.reduce( ( acc, node ) => Math.max( acc, node.position.y + getNodeDimensions( node, opts ).height ), 0 );

        componentBounds.push( { ids: componentIds, width: maxX, height: maxY } );
    } );

    // --- Phase 3: Grid-pack connected components ---
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

    // --- Phase 4: Fan-out compaction (componentNode→componentNode only) ---
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

        if ( source === target ) {
            return;
        }

        const edgeData = edge.data as { isBackEdge?: boolean } | undefined;
        if ( edgeData?.isBackEdge ) {
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

    const forwardEdgeSet = new Set<string>();
    edges.forEach( edge => {
        const edgeData = edge.data as { isBackEdge?: boolean } | undefined;
        if ( !edgeData?.isBackEdge && edge.source !== edge.target ) {
            forwardEdgeSet.add( `${ edge.source }->${ edge.target }` );
        }
    } );

    fanouts.forEach( ( targets, sourceId ) => {
        if ( targets.size < 2 ) {
            return;
        }

        const targetArray = [ ...targets ];
        const hasChainBetweenTargets = targetArray.some( ( t1, i ) =>
            targetArray.slice( i + 1 ).some( t2 =>
                forwardEdgeSet.has( `${ t1 }->${ t2 }` ) || forwardEdgeSet.has( `${ t2 }->${ t1 }` )
            )
        );

        if ( hasChainBetweenTargets ) {
            return;
        }

        const sourceNode = compactedNodeById.get( sourceId );
        if ( !sourceNode ) {
            return;
        }

        const sourceDimensions = getNodeDimensions( sourceNode, opts );
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
            ? getNodeDimensions( firstTargetNode, opts )
            : { width: opts.nodeWidth, height: opts.nodeHeight };

        const spacing = targetDimensions.width + Math.floor( opts.nodeSep * 0.5 );
        const middle = ( targetIds.length - 1 ) / 2;

        // For fan-out, all targets should be at the same Y level (one rank below source)
        const targetY = targetIds.reduce( ( minY, id ) => {
            const node = compactedNodeById.get( id );
            return node ? Math.min( minY, node.position.y ) : minY;
        }, Number.POSITIVE_INFINITY );

        const finalTargetY = Number.isFinite( targetY ) ? targetY : sourceNode.position.y + sourceDimensions.height + opts.rankSep;

        targetIds.forEach( ( targetId, index ) => {
            const targetNode = compactedNodeById.get( targetId );
            if ( !targetNode ) {
                return;
            }

            const centerX = sourceCenterX + ( index - middle ) * spacing;
            targetNode.position = {
                x: centerX - targetDimensions.width / 2,
                y: finalTargetY
            };
        } );
    } );

    // --- Phase 5: Position satellite modals relative to their parent components ---
    // Sync compacted positions back into layoutedNodesById for modal positioning
    nodesWithCompactedFanouts.forEach( node => {
        layoutedNodesById.set( node.id, node );
    } );

    positionSatelliteModals( layoutedNodesById, satelliteModals, parentToModalIds, opts );
    resolveModalOverlaps( layoutedNodesById, satelliteModals, parentToModalIds, mainNodes, opts );

    // --- Phase 6: Assemble final node list preserving original order ---
    const finalNodes = nodes
        .map( ( node ) => layoutedNodesById.get( node.id ) ?? node )
        .map( node => ( { ...node } ) );

    return { nodes: finalNodes, edges };
}
