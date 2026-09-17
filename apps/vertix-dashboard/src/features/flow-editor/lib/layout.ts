import Dagre from "@dagrejs/dagre";

import { LAYOUT_OPTIONS, NODE_DIMENSIONS } from "@vertix.gg/dashboard/src/features/flow-editor/lib/constants";
import { measureComponentNodeWidth } from "@vertix.gg/dashboard/src/features/flow-editor/lib/element-metrics";

import type { MeasurableElement } from "@vertix.gg/dashboard/src/features/flow-editor/lib/element-metrics";

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

/** How far out to either side a modal stack is tried before it settles for the old placement. */
const MODAL_PLACEMENT_ATTEMPTS = 6;

const NODE_TYPE_DIMENSIONS: Record<string, { width: number; height: number }> = {
    moduleNode: NODE_DIMENSIONS.MODULE,
    flowNode: NODE_DIMENSIONS.FLOW,
    componentNode: NODE_DIMENSIONS.COMPONENT,
    modalNode: NODE_DIMENSIONS.MODAL
};

function getNodeDimensions( node: Node, opts: Required<LayoutOptions> ): { width: number; height: number } {
    // A component node has no fixed width - the browser sizes it to its content. Once react flow
    // has measured it, that real width is what the layout reserves; only the first pass, before
    // anything is on screen, falls back to estimating it from the labels.
    if ( "componentNode" === node.type ) {
        const measured = node.measured?.width ?? ( node as { width?: number } ).width;

        return {
            width: measured
                ?? measureComponentNodeWidth( ( node.data as { elementRows?: MeasurableElement[][] } | undefined )?.elementRows ),
            height: node.measured?.height ?? NODE_DIMENSIONS.COMPONENT.height
        };
    }

    const declared = NODE_TYPE_DIMENSIONS[ node.type ?? "default" ] ?? {
        width: opts.nodeWidth,
        height: opts.nodeHeight
    };

    /*
     * A measured node is whatever it measured, whatever its kind was assumed to be.
     *
     * Only components read their measurements here, and a modal is as variable as they are - it is
     * as tall as the inputs it declares, where the figure stood at a flat 520. The stack is put
     * beside its screen and then checked against everything else for collisions, and a modal a
     * hundred and thirty short of its real height passed a check it should have failed, which is
     * how one came to sit on top of a screen two ranks away.
     */
    return {
        width: node.measured?.width ?? declared.width,
        height: node.measured?.height ?? declared.height
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

    const stackClearsAt = ( modalIds: string[], x: number ): boolean =>
        modalIds.every( modalId => {
            const modal = layoutedNodesById.get( modalId );

            if ( !modal ) {
                return true;
            }

            const dims = getNodeDimensions( modal, opts );
            const top = modal.position.y;
            const bottom = top + dims.height;

            return ! mainBounds.some( b =>
                !( x + dims.width < b.left || x > b.right || bottom < b.top || top > b.bottom )
            );
        } );

    /*
     * For each parent's modals, if any overlap a main node, put the stack somewhere it does not.
     *
     * Moving it to the right of its screen was one attempt at one alternative, taken without
     * looking at what was already there - so a stack whose right side was occupied too stayed
     * exactly as overlapped as it began, which is how the V2 setup editor's delete form came to
     * sit on top of the screen for editing a voice role.
     *
     * The sides are tried alternately, stepping out by the stack's own width each time, and the
     * first that clears everything is taken. Failing all of them it goes right, as before - a
     * modal has to be drawn somewhere, and that was the old answer.
     */
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
        const stackWidth = modalIds.reduce( ( widest, modalId ) => {
            const modal = layoutedNodesById.get( modalId );

            return modal ? Math.max( widest, getNodeDimensions( modal, opts ).width ) : widest;
        }, 0 );

        const step = stackWidth + modalGap;
        const rightOfParent = parentNode.position.x + parentDims.width + modalGap;
        const leftOfParent = parentNode.position.x - stackWidth - modalGap;

        const candidates: number[] = [ rightOfParent ];

        for ( let attempt = 1; attempt <= MODAL_PLACEMENT_ATTEMPTS; attempt++ ) {
            candidates.push( leftOfParent - attempt * step );
            candidates.push( rightOfParent + attempt * step );
        }

        const chosen = candidates.find( x => stackClearsAt( modalIds, x ) ) ?? rightOfParent;

        modalIds.forEach( modalId => {
            const modal = layoutedNodesById.get( modalId );
            if ( !modal ) {
                return;
            }

            layoutedNodesById.set( modalId, {
                ...modal,
                position: {
                    x: chosen,
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

    /*
     * --- Phase 0b: a line from one flow to another is drawn, but does not rank them together ---
     *
     * Three kinds of line leave a flow: the module's line to the flows it owns, a button that opens
     * another flow, and a router's line to where it routes. Every one of them joins two flows that
     * have nothing else to do with each other, and handed to the ranking they weld the whole module
     * into a single graph - one component of a hundred and fifty nodes, laid out in ranks forty
     * screens wide, where a flow's own two screens can end up sixteen thousand pixels apart with
     * eleven other flows' screens in between.
     *
     * Left out of the ranking, each flow ranks alone and its screens sit together, which is what
     * anybody reading one flow is reading. The lines themselves are untouched: this list is only
     * what the layout ranks on, and every edge is returned and drawn exactly as it came in.
     *
     * Every green crossing on the v3 canvas was between two different flows - none was within one -
     * so a flow's screens sitting together and the lines not crossing are the same fact.
     */
    const nodeTypeById = new Map( mainNodes.map( ( node ) => [ node.id, node.type ?? "" ] ) );

    const isCrossFlowEdge = ( edge: Edge ): boolean =>
        edge.id.startsWith( "edge-module-" )
        || edge.id.startsWith( "edge-btn-flow-" )
        || ( "flowNode" === nodeTypeById.get( edge.source ) && "flowNode" === nodeTypeById.get( edge.target ) );

    const rankingEdges = mainEdges.filter( ( edge ) => ! isCrossFlowEdge( edge ) );

    // --- Phase 1: Connected component detection (main nodes only) ---
    const adjacency = new Map<string, Set<string>>();

    mainNodes.forEach( ( node ) => {
        adjacency.set( node.id, new Set() );
    } );

    rankingEdges.forEach( ( edge ) => {
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

        const componentIdSet = new Set( componentIds );

        rankingEdges.forEach( ( edge ) => {
            if ( !componentIdSet.has( edge.source ) || !componentIdSet.has( edge.target ) ) {
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
    /*
     * How wide to let a row of flows run before starting the next one.
     *
     * The square root of the total area would pack them into a square, which sounds right and is
     * not: a flow is far taller than it is wide - a column of screens seven hundred pixels each -
     * so squaring the whole makes a canvas half as wide as it is tall, and a reader scrolls. Four
     * times the area puts the v3 canvas at about three to two, which is the shape of a screen.
     *
     * Before the flows were separated this line had nothing to do: there was one component, and one
     * component packs the same whatever the row width.
     */
    /*
     * The module and its routers are not among the things being packed.
     *
     * Once a flow's lines to other flows stopped ranking, anything whose every line goes to another
     * flow was left with no ranked edge at all - the module, which is joined to every flow and to
     * nothing else, and a router with no screen of its own, whose whole job is to send a press
     * somewhere else. Each became a component of one and took a cell of the grid, so the module sat
     * out on the left of the first row and the command router sat somewhere among the flows it
     * routes into.
     *
     * Neither is a sibling of the flows. The module is what they all hang off and a router is the
     * way in to them, so both are held back here and put at the head once the flows are placed.
     *
     * A router that does have a screen - the control panel is one - is a flow like any other and
     * stays in the grid with its screen.
     */
    const mainNodeById = new Map( mainNodes.map( ( node ) => [ node.id, node ] ) );

    const isRouterNode = ( id: string ): boolean => {
        const node = mainNodeById.get( id );

        return "flowNode" === node?.type && true === ( node.data as { isSystemFlow?: boolean } | undefined )?.isSystemFlow;
    };

    const moduleComponent = componentBounds.find( ( bounds ) =>
        bounds.ids.every( ( id ) => "moduleNode" === nodeTypeById.get( id ) ) );

    const routerComponents = componentBounds.filter( ( bounds ) => bounds.ids.every( isRouterNode ) );

    const heldBack = new Set( [ moduleComponent, ...routerComponents ].filter( Boolean ) );

    const packedBounds = componentBounds.filter( ( bounds ) => ! heldBack.has( bounds ) );

    const totalArea = packedBounds.reduce( ( acc, b ) => acc + ( b.width * b.height ), 0 );
    const targetRowWidth = totalArea > 0 ? Math.sqrt( totalArea * 4 ) : 0;
    const gapX = opts.nodeSep;
    const gapY = opts.rankSep;

    let cursorX = 0;
    let cursorY = 0;
    let rowHeight = 0;

    packedBounds.forEach( ( bounds ) => {
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

        /*
         * Each screen takes up its own width, laid left to right from the middle.
         *
         * Every one of them used to be spaced by the FIRST one's width, which is right only while
         * they all happen to be the same. A screen sizes itself to what it draws, so a row holding
         * a wide one and a narrow one had the narrow ones spaced too far apart and anything wider
         * than the first sitting on top of its neighbour - and only the first was centred on the
         * slot it was given.
         */
        const targetWidths = targetIds.map( ( id ) => {
            const node = compactedNodeById.get( id );

            return node ? getNodeDimensions( node, opts ).width : opts.nodeWidth;
        } );

        const gap = Math.floor( opts.nodeSep * 0.5 ),
            runWidth = targetWidths.reduce( ( total, width ) => total + width, 0 ) + gap * ( targetIds.length - 1 );

        let cursorLeft = sourceCenterX - runWidth / 2;

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

            targetNode.position = {
                x: cursorLeft,
                y: finalTargetY
            };

            cursorLeft += targetWidths[ index ] + gap;
        } );
    } );

    // --- Phase 5: Position satellite modals relative to their parent components ---
    // Sync compacted positions back into layoutedNodesById for modal positioning
    nodesWithCompactedFanouts.forEach( node => {
        layoutedNodesById.set( node.id, node );
    } );

    /*
     * --- Phase 4b: the module and its routers go at the head of what they reach ---
     *
     * Three bands, read downwards: the module, the routers it declares, then the flows. That is the
     * order somebody arrives in - a press reaches a router, the router opens a flow - and the lines
     * between the bands are the module's amber and the routers' dashed green, which now run a rank
     * instead of the width of the canvas.
     *
     * Each band is centred on the flows below it and placed a rank above them. Last of all the
     * phases, so it reads the final positions: the packing and the fan-out compaction both still
     * move things after dagre has handed over.
     */
    const bandExtent = ( exclude: Set<string> ) => {
        const placed = mainNodes
            .map( ( node ) => layoutedNodesById.get( node.id ) )
            .filter( ( node ): node is Node => Boolean( node ) && ! exclude.has( node!.id ) );

        if ( ! placed.length ) {
            return null;
        }

        return {
            left: Math.min( ...placed.map( ( node ) => node.position.x ) ),
            right: Math.max( ...placed.map( ( node ) => node.position.x + getNodeDimensions( node, opts ).width ) ),
            top: Math.min( ...placed.map( ( node ) => node.position.y ) )
        };
    };

    /** Lays a set of nodes out as one centred row, sitting a rank above everything below it. */
    const placeBand = ( ids: string[], exclude: Set<string> ) => {
        const extent = bandExtent( exclude );

        if ( ! extent || ! ids.length ) {
            return;
        }

        const banded = ids
            .map( ( id ) => layoutedNodesById.get( id ) )
            .filter( ( node ): node is Node => Boolean( node ) );

        const widths = banded.map( ( node ) => getNodeDimensions( node, opts ).width ),
            height = Math.max( ...banded.map( ( node ) => getNodeDimensions( node, opts ).height ) ),
            runWidth = widths.reduce( ( total, width ) => total + width, 0 ) + opts.nodeSep * ( banded.length - 1 );

        let cursor = ( extent.left + extent.right ) / 2 - runWidth / 2;

        banded.forEach( ( node, index ) => {
            layoutedNodesById.set( node.id, {
                ...node,
                position: { x: cursor, y: extent.top - height - opts.rankSep }
            } );

            cursor += widths[ index ] + opts.nodeSep;
        } );
    };

    const routerIds = routerComponents.flatMap( ( bounds ) => bounds.ids ),
        moduleIds = moduleComponent?.ids ?? [];

    // Routers first, then the module above them - each measured against what is already placed.
    placeBand( routerIds, new Set( [ ...routerIds, ...moduleIds ] ) );
    placeBand( moduleIds, new Set( moduleIds ) );

    positionSatelliteModals( layoutedNodesById, satelliteModals, parentToModalIds, opts );
    resolveModalOverlaps( layoutedNodesById, parentToModalIds, mainNodes, opts );

    // --- Phase 6: Assemble final node list preserving original order ---
    const finalNodes = nodes
        .map( ( node ) => layoutedNodesById.get( node.id ) ?? node )
        .map( node => ( { ...node } ) );

    return { nodes: finalNodes, edges };
}
