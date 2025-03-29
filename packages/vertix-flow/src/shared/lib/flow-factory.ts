import { calculateGroupPosition, getViewportDimensions } from "@vertix.gg/flow/src/shared/lib/position-calculator";

import type { Node } from "@xyflow/react";

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
    embeds?: Array<unknown>;
}

// Default implementation of the factory
export class DefaultFlowFactory implements FlowFactory {
    public createFlowDiagram( flowData: FlowData ): FlowDiagram {
        const nodes: Node[] = [];

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

        return { nodes };
    }

    // Helper method to create component nodes from schemas
    private createComponentNodes( components: FlowComponent[] ): ComponentNode[] {
        return components.map( ( component: FlowComponent, componentIndex: number ): ComponentNode => {
            const componentId = `component-${ componentIndex }`;
            const componentLabel = component.name?.split( "/" ).pop() || `Component ${ componentIndex + 1 }`;

            // Create a single node structure for the component
            const result: ComponentNode = {
                id: componentId,
                label: componentLabel,
                type: "component",
                // Add embeds directly to the component data
                embeds: component.entities?.embeds?.map( ( embed, embedIndex ) => ( {
                    id: `${ componentId }-embed-${ embedIndex }`,
                    label: embed.name.split( "/" ).pop() || `Embed ${ embedIndex + 1 }`,
                    attributes: embed.attributes || {}
                } ) ) || [],
                // Add elements directly to the component data
                elements: component.entities?.elements?.map( ( row, rowIndex ) => ( {
                    id: `${ componentId }-row-${ rowIndex }`,
                    label: `Row ${ rowIndex + 1 }`,
                    elements: row.map( ( element, elementIndex ) => ( {
                        id: `${ componentId }-element-${ rowIndex }-${ elementIndex }`,
                        label: element.name.split( "/" ).pop() || `Element ${ elementIndex + 1 }`,
                        type: element.type || "element",
                        attributes: element.attributes
                    } ) )
                } ) ) || []
            };

            // Recursively process child components if they exist
            if ( component.components?.length ) {
                result.childNodes = this.createComponentNodes( component.components );
            }

            return result;
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
