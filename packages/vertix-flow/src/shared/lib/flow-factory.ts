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
        elementGroup.forEach( ( element, index ) => {
          const id = `element-${ groupIndex }-${ index }`;
          const elementLabel = element.name.split( "/" ).pop() || "Element";

          // Position directly below the corresponding bottom button
          const yPosition = 930; // Position at the very bottom of the flow diagram

          // For 3 buttons layout: left button, middle button, right button
          // Calculate x position - these match approximately positions in the image
          let xPosition = 250; // Default center

          if ( elementGroup.length === 3 ) {
            if ( index === 0 ) xPosition = 125; // Left button (Community Server)
            else if ( index === 1 ) xPosition = 250; // Middle button (Invite Vertix)
            else if ( index === 2 ) xPosition = 375; // Right button (Setup)
          }
          // For other numbers of buttons, space them evenly
          else {
            const spacing = 150;
            const totalWidth = elementGroup.length * spacing;
            const startX = 250 - ( totalWidth / 2 ) + ( spacing / 2 );
            xPosition = startX + ( index * spacing );
          }

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
