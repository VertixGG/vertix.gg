import { calculateGroupPosition, getViewportDimensions } from "@vertix.gg/flow/src/shared/lib/position-calculator";

import type { Node, Edge } from "@xyflow/react";

import type { FlowComponent, FlowDiagram, FlowData } from "@vertix.gg/flow/src/shared/types/flow";

// Factory interface for creating flow operations
export interface FlowFactory {
    createFlowDiagram( flowData: FlowData ): FlowDiagram;

    createFlowInteraction( flowClass: unknown ): FlowInteractionController;

    createNodeStyle(): Record<string, unknown>;
}

// Interface for flow interaction control
export interface FlowInteractionController {
    getInitialState(): string;

    getAvailableTransitions( state: string ): string[];

    performTransition( transition: string ): void;

    getStateData(): Record<string, unknown>;
}

interface ComponentNode {
    id: string;
    label: string;
    type: string;
    groupType?: string;
    childNodes?: ComponentNode[];
    attributes?: Record<string, unknown>;
    elements?: Array<unknown>;
}

// Default implementation of the factory
export class DefaultFlowFactory implements FlowFactory {
    public createFlowDiagram( flowData: FlowData ): FlowDiagram {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Extract flow data components
        const { transactions, requiredData, components, name } = flowData;

        // Get viewport dimensions for responsive layout
        const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();

        // Define canvas dimensions for relative positioning
        const canvasWidth = Math.min( viewportWidth * 0.9, 1200 );  // Responsive with max width
        const canvasHeight = Math.min( viewportHeight * 0.8, 900 ); // Responsive with max height

        // Calculate group position using the new utility
        const groupPosition = calculateGroupPosition( {
            containerWidth: canvasWidth,
            containerHeight: canvasHeight
        } );

        // Create the Flow group that contains the Components group
        nodes.push( {
            id: "flow-group",
            type: "compound",
            position: { x: groupPosition.x, y: groupPosition.y },
            style: {
                width: groupPosition.width,
                height: groupPosition.height,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between"
            },
            data: {
                // Now we have access to the full flow data
                id: "flow-group",
                label: `Flow :: ${ name }`,
                groupType: "Flow",
                type: "group",
                transactions: transactions,
                requiredData: requiredData,
                childNodes: [
                    // Components group as a child of Flow
                    {
                        id: "components-group",
                        label: "Components",
                        type: "group",
                        groupType: "Components",
                        childNodes: components && components.length > 0 ? this.createComponentNodes( components ) : []
                    }
                ]
            },
            draggable: true
        } );

        // Add edges for component connections if components exist
        if ( components && components.length > 0 ) {
            this.createComponentEdges( components, edges );
        }

        return { nodes, edges };
    }

    // Helper method to create component nodes from schemas
    private createComponentNodes( components: FlowComponent[] ): ComponentNode[] {
        return components.map( ( component: FlowComponent, componentIndex: number ): ComponentNode => {
            const componentId = `component-${ componentIndex }`;
            const componentLabel = component.name?.split( "/" ).pop() || `Component ${ componentIndex + 1 }`;

            // Create child nodes for each component
            const childNodes: ComponentNode[] = [];

            // Add root component node
            childNodes.push( {
                id: `${ componentId }-root`,
                label: componentLabel,
                type: "component"
            } );

            // Add embeds if they exist
            if ( component.entities?.embeds?.length ) {
                component.entities.embeds.forEach( ( embed, embedIndex ) => {
                    // Check if elements exist to add them to the embed
                    const elements = component.entities?.elements?.length ?
                        component.entities.elements : undefined;

                    childNodes.push( {
                        id: `${ componentId }-embed-${ embedIndex }`,
                        label: embed.name.split( "/" ).pop() || `Embed ${ embedIndex + 1 }`,
                        type: "embed",
                        attributes: embed.attributes || {},
                        elements: elements // Pass the elements array to the embed node
                    } );
                } );
            }

            // Add elements group if elements exist
            if ( component.entities?.elements?.length ) {
                childNodes.push( {
                    id: `${ componentId }-elements-group`,
                    label: "Elements",
                    type: "group",
                    groupType: "Elements",
                    childNodes: component.entities.elements.flat().map( ( element, elementIndex ) => ( {
                        id: `${ componentId }-element-${ elementIndex }`,
                        label: element.name.split( "/" ).pop() || `Element ${ elementIndex + 1 }`,
                        type: element.type || "element",
                        attributes: element.attributes
                    } ) )
                } );
            }

            // Recursively process child components if they exist
            if ( component.components?.length ) {
                const childComponentsGroup: ComponentNode = {
                    id: `${ componentId }-child-components-group`,
                    label: "Child Components",
                    type: "group",
                    groupType: "ChildComponents",
                    childNodes: this.createComponentNodes( component.components )
                };

                childNodes.push( childComponentsGroup );

                // Add edges from root to child components group in the createComponentEdges method
            }

            const result: ComponentNode = {
                id: componentId,
                label: componentLabel,
                type: "group",
                groupType: "Component",
                childNodes
            };

            return result;
        } );
    }

    // Helper method to create edges between component elements
    private createComponentEdges( components: FlowComponent[] | FlowComponent, edges: Edge[] ) {
        const componentsArray = Array.isArray( components ) ? components : [ components ];

        componentsArray.forEach( ( component, componentIndex ) => {
            const componentId = `component-${ componentIndex }`;

            // Add edges from root to embeds
            if ( component.entities?.embeds?.length ) {
                component.entities.embeds.forEach( ( _, embedIndex ) => {
                    edges.push( {
                        id: `${ componentId }-root-to-embed-${ embedIndex }`,
                        source: `${ componentId }-root`,
                        target: `${ componentId }-embed-${ embedIndex }`,
                        animated: true,
                        style: { stroke: "#a78bfa" },
                        type: "smoothstep"
                    } );
                } );
            }

            // Add edges from root to child components group if components exist
            if ( component.components?.length ) {
                edges.push( {
                    id: `${ componentId }-root-to-child-components`,
                    source: `${ componentId }-root`,
                    target: `${ componentId }-child-components-group`,
                    animated: true,
                    style: { stroke: "#60a5fa" },
                    type: "smoothstep"
                } );

                // Recursively add edges for child components
                this.createComponentEdges( component.components, edges );
            }

            // Skip creating edges from embeds to elements group if we're already connecting elements to embeds
            // This avoids duplicate edges
            /*
            // Add edges from embeds to elements group if both exist
            if ( component.entities?.embeds?.length && component.entities?.elements?.length ) {
                component.entities.embeds.forEach( ( _, embedIndex ) => {
                    edges.push( {
                        id: `${ componentId }-embed-${ embedIndex }-to-elements`,
                        source: `${ componentId }-embed-${ embedIndex }`,
                        target: `${ componentId }-elements-group`,
                        animated: true,
                        style: { stroke: "#34d399" },
                        type: "smoothstep",
                        zIndex: 0
                    } );
                } );
            }
            */
        } );
    }

    public createFlowInteraction( flowClass: unknown ): FlowInteractionController {
        return {
            getInitialState: () => {
                try {
                    // Type assertion here since we're expecting a certain interface
                    return ( flowClass as { getInitialState: () => string } ).getInitialState();
                } catch  {
                    return "error";
                }
            },

            getAvailableTransitions: ( state: string ) => {
                try {
                    // Type assertion with safety check
                    const transitions = ( flowClass as {
                        getAvailableTransitions: ( state: string ) => string[]
                    } ).getAvailableTransitions( state );
                    return transitions || [];
                } catch  {
                    return [];
                }
            },

            performTransition: ( transition: string ) => {
                try {
                    // Type check before executing
                    const flowClassWithTransition = flowClass as {
                        transition?: ( transitionName: string ) => void
                    };

                    if ( flowClassWithTransition.transition ) {
                        flowClassWithTransition.transition( transition );
                    }
                } catch  {
                    // Error handled silently
                }
            },

            getStateData: () => {
                try {
                    // Type assertion with safety
                    const data = ( flowClass as {
                        getData: () => Record<string, unknown> | null
                    } ).getData();
                    return data || {};
                } catch  {
                    return {};
                }
            }
        };
    }

    public createNodeStyle(): Record<string, unknown> {
        // Remove all styling from here since we handle it in the CustomNode component
        return {};
    }
}

// Create a singleton instance
export const flowFactory = new DefaultFlowFactory();

// Helper function to access the factory
export function useFlowFactory(): FlowFactory {
    return flowFactory;
}
