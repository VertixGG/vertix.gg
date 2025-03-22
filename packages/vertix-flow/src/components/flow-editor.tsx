import React, { useCallback, useState, Suspense } from "react";
import "reactflow/dist/style.css";

import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    Position,
} from "reactflow";

import { UIModuleSelector } from "@vertix.gg/flow/src/components/ui-module-selector";
import { FlowListDisplay } from "@vertix.gg/flow/src/components/flow-list-display";
import { FlowInteraction } from "@vertix.gg/flow/src/components/flow-interaction";

import { Card, CardContent, CardHeader, CardTitle } from "@vertix.gg/flow/src/components/ui/card";
import { Separator } from "@vertix.gg/flow/src/components/ui/separator";
import { Badge } from "@vertix.gg/flow/src/components/ui/badge";

import type { Connection, Edge, Node } from "reactflow";
import type { UIModuleFile } from "@vertix.gg/flow/src/hooks/use-ui-modules";
import { useFlowData } from "@vertix.gg/flow/src/hooks/use-ui-modules";

// Initial nodes setup
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface FlowItem {
    name: string;
    FlowClass?: any; // The actual flow class (optional now)
    modulePath?: string; // Added module path for fetching flow data
}

interface FlowSchema {
    name: string;
    type: string;
    entities: {
        elements: Array<Array<{
            name: string;
            type: string;
            attributes: Record<string, any>;
            isAvailable: boolean;
        }>>;
        embeds: Array<{
            name: string;
            type: string;
            attributes: Record<string, any>;
            isAvailable: boolean;
        }>;
    };
}

// Function to generate nodes and edges from schema
function generateFlowDiagram( schema: FlowSchema ): { nodes: Node[], edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add root component node
    nodes.push( {
        id: 'root',
        type: 'input',
        data: {
            label: schema.name.split( '/' ).pop() || 'Component',
            type: schema.type
        },
        position: { x: 250, y: 50 },
        style: {
            background: '#60a5fa',
            color: 'white',
            borderRadius: '4px',
            padding: '10px',
            minWidth: '150px',
            textAlign: 'center' as const
        }
    } );

    // Add embed nodes
    if ( schema.entities.embeds ) {
        schema.entities.embeds.forEach( ( embed, index ) => {
            const id = `embed-${ index }`;
            nodes.push( {
                id,
                type: 'default',
                data: {
                    label: embed.name.split( '/' ).pop() || 'Embed',
                    type: 'embed',
                    attributes: embed.attributes
                },
                position: { x: 150, y: 150 + ( index * 100 ) },
                style: {
                    background: '#a78bfa',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '10px',
                    width: '180px',
                    textAlign: 'center' as const
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left
            } );

            // Connect to root
            edges.push( {
                id: `root-to-${ id }`,
                source: 'root',
                target: id,
                animated: true,
                style: { stroke: '#a78bfa' }
            } );
        } );
    }

    // Add element nodes
    if ( schema.entities.elements ) {
        schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
            elementGroup.forEach( ( element, index ) => {
                const id = `element-${ groupIndex }-${ index }`;
                const xPosition = 450 + ( groupIndex * 220 );
                nodes.push( {
                    id,
                    type: 'default',
                    data: {
                        label: element.name.split( '/' ).pop() || 'Element',
                        type: element.type,
                        attributes: element.attributes
                    },
                    position: { x: xPosition, y: 150 + ( index * 100 ) },
                    style: {
                        background: '#34d399',
                        color: 'white',
                        borderRadius: '4px',
                        padding: '10px',
                        width: '180px',
                        textAlign: 'center' as const
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left
                } );

                // Connect to root
                edges.push( {
                    id: `root-to-${ id }`,
                    source: 'root',
                    target: id,
                    animated: true,
                    style: { stroke: '#34d399' }
                } );
            } );
        } );
    }

    return { nodes, edges };
}

// Flow data display component
function FlowDataDisplay( { modulePath, flowName, onSchemaLoaded }: {
    modulePath: string;
    flowName: string;
    onSchemaLoaded?: ( schema: any ) => void;
} ) {
    const flowDataResource = useFlowData( modulePath, flowName );

    // Create a stable reference to the onSchemaLoaded callback using useCallback
    const stableOnSchemaLoaded = React.useCallback( ( schema: any ) => {
        if ( onSchemaLoaded ) {
            onSchemaLoaded( schema );
        }
    }, [ onSchemaLoaded ] );

    // Memoize the flow data to avoid unnecessary re-renders
    const flowData = React.useMemo( () => {
        try {
            return flowDataResource.read();
        } catch ( error ) {
            console.error( "Error reading flow data:", error );
            return null;
        }
    }, [ flowDataResource ] );

    // Use a ref to track if we've already processed this schema
    const processedSchemaId = React.useRef<string | null>( null );

    // Create a stable version of the schema for comparison
    const schemaId = React.useMemo( () => flowData?.schema?.name || '', [ flowData?.schema?.name ] );

    // Separate effect to handle schema loading - runs once per schema
    React.useEffect( () => {
        // Only run if we have data and the schema ID has changed
        if ( flowData?.schema && schemaId && processedSchemaId.current !== schemaId ) {
            // Track that we've processed this schema
            processedSchemaId.current = schemaId;

            // Use a small timeout to debounce multiple calls
            const timeoutId = setTimeout( () => {
                stableOnSchemaLoaded( flowData.schema );
            }, 100 );

            // Cleanup timeout on unmount or when dependencies change
            return () => clearTimeout( timeoutId );
        }
    }, [ schemaId, flowData?.schema, stableOnSchemaLoaded ] );

    if ( !flowData ) {
        return <div>No flow data available</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Flow Data: {flowName}</h3>

            <div>
                <h4 className="text-sm font-medium mb-2">Transactions:</h4>
                <div className="flex flex-wrap gap-2">
                    {flowData.transactions.map( ( transaction, index ) => (
                        <Badge key={index}>{transaction}</Badge>
                    ) )}
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="text-sm font-medium mb-2">Required Data:</h4>
                <div className="space-y-2">
                    {Object.entries( flowData.requiredData ).map( ( [ transaction, data ], index ) => (
                        <div key={index} className="pl-2 border-l-2 border-primary">
                            <div className="font-medium">{transaction}:</div>
                            <div className="flex flex-wrap gap-1 pl-3">
                                {data.map( ( field, i ) => (
                                    <Badge key={i} variant="outline" className="text-xs">{field}</Badge>
                                ) )}
                            </div>
                        </div>
                    ) )}
                </div>
            </div>

            {flowData.schema && (
                <>
                    <Separator />
                    <div>
                        <h4 className="text-sm font-medium mb-2">Schema:</h4>
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
                            {JSON.stringify( flowData.schema, null, 2 )}
                        </pre>
                    </div>
                </>
            )}
        </div>
    );
}

// Custom node component for displaying node details
const CustomNode = ( { data }: { data: any } ) => {
    return (
        <div className="p-2 rounded shadow-md bg-white border border-gray-200">
            <div className="font-medium text-sm">{data.label}</div>
            <div className="text-xs text-gray-500">{data.type}</div>
            {data.attributes && (
                <div className="mt-1">
                    {data.attributes.label && (
                        <div className="text-xs font-medium">{data.attributes.label}</div>
                    )}
                    {data.attributes.emoji && (
                        <div className="text-sm">{data.attributes.emoji.name}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export const FlowEditor: React.FC = () => {
    const [ nodes, setNodes, onNodesChange ] = useNodesState( initialNodes );
    const [ edges, setEdges, onEdgesChange ] = useEdgesState( initialEdges );
    const [ moduleName, setModuleName ] = useState<string>( "" );
    const [ modulePath, setModulePath ] = useState<string>( "" ); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [ flows, setFlows ] = useState<FlowItem[]>( [] );
    const [ selectedFlow, setSelectedFlow ] = useState<FlowItem | null>( null );

    // Handle new connections between nodes
    const onConnect = useCallback( ( params: Connection ) => setEdges( ( eds ) => addEdge( params, eds ) ), [ setEdges ] );

    // Handle UI module selection
    const handleModuleSelected = useCallback( ( module: UIModuleFile ) => {
        // Update state with the module information
        setModuleName( module.moduleInfo?.name || "" );
        setModulePath( module.path || "" );

        if ( module.moduleInfo?.flows ) {
            // Use the flows data from moduleInfo directly
            const flowItems = module.moduleInfo.flows.map( flowName => ( {
                name: flowName,
                modulePath: module.path
            } ) );
            setFlows( flowItems );
        } else {
            setFlows( [] );
        }

        // Reset selected flow when module changes
        setSelectedFlow( null );

        // Reset flow diagram
        setNodes( [] );
        setEdges( [] );
    }, [ setNodes, setEdges ] );

    // Handle flow selection
    const handleFlowSelect = useCallback( ( flow: FlowItem ) => {
        setSelectedFlow( flow );
    }, [] );

    // Handle schema loaded from flow data
    const handleSchemaLoaded = useCallback( ( schema: FlowSchema ) => {
        if ( schema ) {
            const { nodes: flowNodes, edges: flowEdges } = generateFlowDiagram( schema );
            setNodes( flowNodes );
            setEdges( flowEdges );
        }
    }, [ setNodes, setEdges ] );

    return (
        <div className="w-full h-full flex flex-col">
            {/* Top section with file selector and flow list display */}
            <div className="flex-none bg-background">
                <Card className="m-4 border">
                    <CardHeader className="pb-2">
                        <CardTitle>Flow Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <UIModuleSelector onModuleSelected={handleModuleSelected} />
                            {moduleName && (
                                <FlowListDisplay
                                    moduleName={moduleName}
                                    flows={flows}
                                    onFlowSelect={handleFlowSelect}
                                />
                            )}

                            {selectedFlow && selectedFlow.modulePath && (
                                <Suspense fallback={<div>Loading flow data...</div>}>
                                    <FlowDataDisplay
                                        modulePath={selectedFlow.modulePath}
                                        flowName={selectedFlow.name}
                                        onSchemaLoaded={handleSchemaLoaded}
                                    />
                                </Suspense>
                            )}

                            {selectedFlow && selectedFlow.FlowClass && (
                                <FlowInteraction
                                    flowName={selectedFlow.name}
                                    FlowClass={selectedFlow.FlowClass}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Flow editor canvas */}
            <div className="flex-1 min-h-0">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    nodeTypes={{ default: CustomNode }}
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};
