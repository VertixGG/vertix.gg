import type { Node, Edge } from "@xyflow/react";

import type { FlowSchema, FlowDiagram } from "@vertix.gg/flow/src/shared/types/flow";
import {
  calculateGroupPosition,
  getViewportDimensions
} from "@vertix.gg/flow/src/shared/lib/position-calculator";

// Factory interface for creating flow operations
export interface FlowFactory {
  createFlowDiagram( schema: FlowSchema ): FlowDiagram;
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

// Default implementation of the factory
export class DefaultFlowFactory implements FlowFactory {
  public createFlowDiagram( schema: FlowSchema ): FlowDiagram {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Get viewport dimensions for responsive layout
    const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();

    // Define canvas dimensions for relative positioning
    const canvasWidth = Math.min( viewportWidth * 0.9, 1200 );  // Responsive with max width
    const canvasHeight = Math.min( viewportHeight * 0.8, 900 ); // Responsive with max height

    // Create a hierarchical structure for compound nodes
    const rootLabel = schema.name.split( "/" ).pop() || "Component";

    // Calculate embed data
    let embedAttributes = {};

    // Collect embed data
    if ( schema.entities && schema.entities.embeds && schema.entities.embeds.length > 0 ) {
      const embed = schema.entities.embeds[ 0 ];
      embedAttributes = embed.attributes;
    }

    // Calculate element layout for the buttons
    interface ElementNode {
      id: string;
      label: string;
      type: string;
      attributes?: Record<string, unknown>;
    }

    const elementNodes: ElementNode[] = [];

    if ( schema.entities && schema.entities.elements ) {
      // Process elements/buttons
      schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
        elementGroup.forEach( ( element ) => {
          const elementLabel = element.name.split( "/" ).pop() || "Element";

          // Add to element nodes collection for the Elements group
          elementNodes.push( {
            id: `element-${ groupIndex }-${ element.name }`,
            label: elementLabel,
            type: element.type,
            attributes: element.attributes
          } );
        } );
      } );
    }

    // Calculate group position using the new utility
    const groupPosition = calculateGroupPosition( {
      containerWidth: canvasWidth,
      containerHeight: canvasHeight
    } );

    // Create the nested component structure using compound nodes
    // This will create actual HTML nesting in the DOM
    nodes.push( {
      id: "components-group",
      type: "compound",
      position: { x: groupPosition.x, y: groupPosition.y },  // Dynamic position
      style: {
        width: groupPosition.width,
        height: groupPosition.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      data: {
        label: "Components",
        type: "group",
        groupType: "Components",
        childNodes: [
          // Root component node at the top
          {
            id: "root",
            label: rootLabel,
            type: "component"
          },
          // Embed node with attributes in the center
          {
            id: "embed-0",
            label: schema.entities?.embeds?.[ 0 ]?.name.split( "/" ).pop() || "Embed",
            type: "embed",
            attributes: embedAttributes,
            elements: schema.entities?.elements  // Pass elements data to show buttons
          },
          // Add Elements group at the bottom
          ...( elementNodes.length > 0 ? [ {
            id: "elements-group",
            label: "Elements",
            type: "group",
            groupType: "Elements",
            // Convert element nodes to proper format
            childNodes: elementNodes.map( node => ( {
              ...node,
              // Make sure each element has a unique ID
              id: `element-${ node.id }`,
              // Ensure type is preserved
              type: node.type || 'element'
            } ) )
          } ] : [] )
        ]
      },
      draggable: true
    } );

    // Add edge from embed to elements group if elements exist
    if ( elementNodes.length > 0 ) {
      edges.push( {
        id: `embed-to-elements`,
        source: "embed-0",
        target: "elements-group",
        animated: true,
        style: { stroke: "#34d399" },
        type: 'smoothstep',
        zIndex: 0
      } );
    }

    // Add edge from root to embed
    edges.push( {
      id: `root-to-embed`,
      source: "root",
      target: "embed-0",
      animated: true,
      style: { stroke: "#a78bfa" },
      type: 'smoothstep'
    } );

    return { nodes, edges };
  }

  public createFlowInteraction( flowClass: unknown ): FlowInteractionController {
    return {
      getInitialState: () => {
        try {
          // Type assertion here since we're expecting a certain interface
          return ( flowClass as { getInitialState: () => string } ).getInitialState();
        } catch ( error ) {
          console.error( "Error getting initial state:", error );
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
        } catch ( error ) {
          console.error( "Error getting available transitions:", error );
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
          } else {
            console.warn( "Flow class does not implement transition method" );
          }
        } catch ( error ) {
          console.error( `Error during transition ${ transition }:`, error );
        }
      },

      getStateData: () => {
        try {
          // Type assertion with safety
          const data = ( flowClass as {
            getData: () => Record<string, unknown> | null
          } ).getData();
          return data || {};
        } catch ( error ) {
          console.error( "Error getting flow data:", error );
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
