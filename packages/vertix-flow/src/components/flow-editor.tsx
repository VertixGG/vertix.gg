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
    console.log( 'generateFlowDiagram called with schema:', schema );

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add root component node
    const rootLabel = schema.name.split( '/' ).pop() || 'Component';
    console.log( 'Creating root node with label:', rootLabel );

    nodes.push( {
        id: 'root',
        type: 'input',
        data: {
            label: rootLabel,
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

    // Check for embeds
    if ( schema.entities && schema.entities.embeds ) {
        console.log( 'Processing embeds:', schema.entities.embeds.length );
        schema.entities.embeds.forEach( ( embed, index ) => {
            const id = `embed-${ index }`;
            const embedLabel = embed.name.split( '/' ).pop() || 'Embed';
            console.log( `Creating embed node #${ index } with label:`, embedLabel );

            nodes.push( {
                id,
                type: 'default',
                data: {
                    label: embedLabel,
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
    } else {
        console.warn( 'No embeds found in schema or entities structure is missing' );
    }

    // Check for elements
    if ( schema.entities && schema.entities.elements ) {
        console.log( 'Processing elements:', schema.entities.elements.length );
        schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
            console.log( `Processing element group #${ groupIndex } with ${ elementGroup.length } elements` );

            elementGroup.forEach( ( element, index ) => {
                const id = `element-${ groupIndex }-${ index }`;
                const elementLabel = element.name.split( '/' ).pop() || 'Element';
                console.log( `Creating element node group ${ groupIndex } #${ index } with label:`, elementLabel );

                const xPosition = 450 + ( groupIndex * 220 );
                nodes.push( {
                    id,
                    type: 'default',
                    data: {
                        label: elementLabel,
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
    } else {
        console.warn( 'No elements found in schema or entities structure is missing' );
    }

    console.log( `Generated ${ nodes.length } nodes and ${ edges.length } edges` );
    return { nodes, edges };
}

// Flow data display component
function FlowDataDisplay( { modulePath, flowName, onSchemaLoaded }: {
    modulePath: string;
    flowName: string;
    onSchemaLoaded?: ( schema: any ) => void;
} ) {
    const flowDataResource = useFlowData( modulePath, flowName );
    const [ error, setError ] = React.useState<string | null>( null );
    const [ isLoading, setIsLoading ] = React.useState( true );
    const [ flowData, setFlowData ] = React.useState<any>( null );

    // Create a stable reference to the onSchemaLoaded callback using useCallback
    const stableOnSchemaLoaded = React.useCallback( ( schema: any ) => {
        if ( onSchemaLoaded ) {
            onSchemaLoaded( schema );
        }
    }, [ onSchemaLoaded ] );

    // Use a ref to track if we've already processed this schema
    const processedSchemaId = React.useRef<string | null>( null );

    // Use effect to handle data loading
    React.useEffect( () => {
        try {
            const data = flowDataResource.read();
            console.log( 'Flow data loaded successfully:', data );
            setFlowData( data );
            setIsLoading( false );
        } catch ( error ) {
            // If the error is a Promise, it means the data is still loading
            if ( error instanceof Promise ) {
                // Handle loading state - data will be loaded when the promise resolves
                error.then( () => {
                    // We'll handle this on the next effect cycle
                } ).catch( err => {
                    console.error( "Error loading flow data:", err );
                    setError( "Failed to load flow data. See console for details." );
                    setIsLoading( false );
                } );
                // We need to re-throw for Suspense to catch
                throw error;
            }

            // Otherwise it's an actual error
            console.error( "Error reading flow data:", error );
            setError( error instanceof Error ? error.message : "Unknown error occurred" );
            setIsLoading( false );
        }
    }, [ flowDataResource ] );

    // Separate effect to handle schema processing after data is loaded
    React.useEffect( () => {
        if ( !flowData || !flowData.schema ) return;

        const schemaId = flowData.schema.name || '';

        // Only run if we have data and the schema ID has changed
        if ( schemaId && processedSchemaId.current !== schemaId ) {
            console.log( 'Processing schema:', schemaId );
            console.log( 'Schema data structure:', JSON.stringify( flowData.schema ) );

            // Track that we've processed this schema
            processedSchemaId.current = schemaId;

            // Ensure the schema has the expected structure
            const validSchema: FlowSchema = {
                name: flowData.schema.name || 'Unknown',
                type: flowData.schema.type || 'component',
                entities: {
                    elements: Array.isArray( flowData.schema.entities?.elements )
                        ? flowData.schema.entities.elements
                        : [],
                    embeds: Array.isArray( flowData.schema.entities?.embeds )
                        ? flowData.schema.entities.embeds
                        : []
                }
            };

            console.log( 'Validated schema structure:', validSchema );

            // Use a small timeout to debounce multiple calls
            const timeoutId = setTimeout( () => {
                stableOnSchemaLoaded( validSchema );
            }, 100 );

            // Cleanup timeout on unmount or when dependencies change
            return () => clearTimeout( timeoutId );
        }
    }, [ flowData, stableOnSchemaLoaded ] );

    if ( isLoading ) {
        return <div>Loading flow data...</div>;
    }

    if ( error ) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if ( !flowData ) {
        return (
            <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
                <h3 className="font-medium">No flow data available</h3>
                <p className="text-sm text-gray-600">Module: {modulePath}</p>
                <p className="text-sm text-gray-600">Flow: {flowName}</p>
            </div>
        );
    }

    // Debug output for transactions
    console.log( 'Transactions:', flowData.transactions );
    console.log( 'Required data:', flowData.requiredData );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Flow Data: {flowName}</h3>

            <div>
                <h4 className="text-sm font-medium mb-2">Transactions:</h4>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray( flowData.transactions ) && flowData.transactions.length > 0 ? (
                        flowData.transactions.map( ( transaction: string, index: number ) => (
                            <Badge key={index}>{transaction}</Badge>
                        ) )
                    ) : (
                        <span className="text-gray-500">No transactions available</span>
                    )}
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="text-sm font-medium mb-2">Required Data:</h4>
                <div className="space-y-2">
                    {flowData.requiredData && Object.keys( flowData.requiredData ).length > 0 ? (
                        Object.entries( flowData.requiredData ).map( ( [ transaction, data ]: [string, unknown], index: number ) => (
                            <div key={index} className="pl-2 border-l-2 border-primary">
                                <div className="font-medium">{transaction}:</div>
                                <div className="flex flex-wrap gap-1 pl-3">
                                    {Array.isArray( data ) ? data.map( ( field: string, i: number ) => (
                                        <Badge key={i} variant="outline" className="text-xs">{field}</Badge>
                                    ) ) : <span className="text-gray-500">Invalid data format</span>}
                                </div>
                            </div>
                        ) )
                    ) : (
                        <span className="text-gray-500">No required data available</span>
                    )}
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
    const [ diagramGenerated, setDiagramGenerated ] = useState( false );

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
        setDiagramGenerated( false );
    }, [ setNodes, setEdges ] );

    // Handle flow selection
    const handleFlowSelect = useCallback( ( flow: FlowItem ) => {
        setSelectedFlow( flow );
        // Reset diagram state when selecting a new flow
        setDiagramGenerated( false );
    }, [] );

    // Handle schema loaded from flow data
    const handleSchemaLoaded = useCallback( ( schema: FlowSchema ) => {
        console.log( 'handleSchemaLoaded called with schema:', schema );

        if ( !schema ) {
            console.warn( 'Schema is null or undefined' );
            return;
        }

        try {
            console.log( 'Generating flow diagram for schema:', schema.name );
            console.log( 'Schema entities:', schema.entities );

            const { nodes: flowNodes, edges: flowEdges } = generateFlowDiagram( schema );

            console.log( 'Generated nodes:', flowNodes.length );
            console.log( 'Generated edges:', flowEdges.length );

            if ( flowNodes.length > 0 ) {
                setNodes( flowNodes );
                setEdges( flowEdges );
                setDiagramGenerated( true );
                console.log( 'Diagram nodes and edges set' );
            } else {
                console.warn( 'No nodes generated from schema' );
            }
        } catch ( error ) {
            console.error( 'Error generating flow diagram:', error );
        }
    }, [ setNodes, setEdges ] );

    // Effect to ensure ReactFlow relayout when nodes change
    React.useEffect( () => {
        if ( nodes.length > 0 ) {
            // Force ReactFlow to update layout
            const timeoutId = setTimeout( () => {
                console.log( 'Forcing ReactFlow layout update' );
                window.dispatchEvent( new Event( 'resize' ) );
            }, 100 );
            return () => clearTimeout( timeoutId );
        }
    }, [ nodes, diagramGenerated ] );

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
            <div className="flex-1 min-h-0 overflow-hidden border-t">
                {nodes.length > 0 ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        nodeTypes={{ default: CustomNode }}
                        className="bg-gray-50"
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <p>{selectedFlow ? "Diagram will appear here" : "Select a flow to visualize"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
