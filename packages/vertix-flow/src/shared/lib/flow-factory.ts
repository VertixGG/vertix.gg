import { Position } from "reactflow";

import type { Node, Edge } from "reactflow";

import type { FlowSchema, FlowDiagram } from "@vertix.gg/flow/src/shared/types/flow";

// Factory interface for creating flow operations
export interface FlowFactory {
  createFlowDiagram( schema: FlowSchema ): FlowDiagram;
  createFlowInteraction( flowClass: any ): FlowInteractionController;
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

    // Add root component node
    const rootLabel = schema.name.split( "/" ).pop() || "Component";

    nodes.push( {
      id: "root",
      type: "custom",
      data: {
        label: rootLabel,
        type: schema.type
      },
      position: { x: 250, y: 50 },
      style: this.createNodeStyle(),
      draggable: true
    } );

    // Process embeds with their buttons
    if ( schema.entities && schema.entities.embeds ) {
      schema.entities.embeds.forEach( ( embed, index ) => {
        const id = `embed-${ index }`;
        const embedLabel = embed.name.split( "/" ).pop() || "Embed";

        nodes.push( {
          id,
          type: "custom",
          data: {
            label: embedLabel,
            type: "embed",
            attributes: embed.attributes,
            elements: schema.entities.elements // Pass buttons as elements to the embed
          },
          position: { x: 250, y: 150 },
          style: this.createNodeStyle(),
          draggable: true
        } );

        // Connect to root
        edges.push( {
          id: `root-to-${ id }`,
          source: "root",
          target: id,
          animated: true,
          style: { stroke: "#a78bfa" },
          type: 'smoothstep'
        } );
      } );
    }

    // Process elements
    if ( schema.entities && schema.entities.elements ) {
      schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
        // Calculate position variables based on the number of elements
        const numElements = elementGroup.length;
        const buttonWidth = 120; // Approximate width of a button
        const totalButtonsWidth = numElements * buttonWidth;
        const padding = 20; // Space between buttons

        // Total width including padding between buttons
        const totalWidth = totalButtonsWidth + ( ( numElements - 1 ) * padding );

        // Starting X position to center the buttons under the embed
        const startX = 250 - ( totalWidth / 2 ) + ( buttonWidth / 2 );

        elementGroup.forEach( ( element, index ) => {
          const id = `element-${ groupIndex }-${ index }`;
          const elementLabel = element.name.split( "/" ).pop() || "Element";

          // Calculate x position based on index and button width + padding
          const xPosition = startX + ( index * ( buttonWidth + padding ) );

          // Y position relative to the embed's position
          const yPosition = 930; // This is a reasonable position below the embed

          nodes.push( {
            id,
            type: "custom",
            data: {
              label: elementLabel,
              type: element.type,
              attributes: element.attributes
            },
            position: { x: xPosition, y: yPosition },
            style: this.createNodeStyle(),
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
            draggable: true
          } );

          // Connect to embed
          edges.push( {
            id: `embed-to-${ id }`,
            source: "embed-0",
            target: id,
            animated: true,
            style: { stroke: "#34d399" },
            type: 'smoothstep'
          } );
        } );
      } );
    }

    return { nodes, edges };
  }

  public createFlowInteraction( flowClass: any ): FlowInteractionController {
    return {
      getInitialState: () => {
        try {
          return flowClass.getInitialState();
        } catch ( error ) {
          console.error( "Error getting initial state:", error );
          return "error";
        }
      },

      getAvailableTransitions: ( state: string ) => {
        try {
          return flowClass.getAvailableTransitions( state ) || [];
        } catch ( error ) {
          console.error( "Error getting available transitions:", error );
          return [];
        }
      },

      performTransition: ( transition: string ) => {
        try {
          if ( flowClass.transition ) {
            flowClass.transition( transition );
          } else {
            console.warn( "Flow class does not implement transition method" );
          }
        } catch ( error ) {
          console.error( `Error during transition ${ transition }:`, error );
        }
      },

      getStateData: () => {
        try {
          return flowClass.getData() || {};
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
