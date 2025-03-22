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
      // Count total elements to determine group size
      let totalElements = 0;
      schema.entities.elements.forEach( group => totalElements += group.length );

      // Skip creating a group if there are no elements
      if ( totalElements === 0 ) return { nodes, edges };

      // Settings for element layout
      const elementWidth = 160;      // Width per element
      const elementSpacing = 30;     // Space between elements
      const groupPadding = 30;       // Padding inside the group
      const elementHeight = 60;      // Approximate height of an element

      // Calculate group dimensions
      const groupWidth = ( elementWidth * totalElements ) +
                        ( elementSpacing * ( totalElements - 1 ) ) +
                        ( groupPadding * 2 );
      const groupHeight = elementHeight + ( groupPadding * 2 );

      // Center position for the group
      const groupX = 250 - ( groupWidth / 2 );
      const groupY = 400;

      // Create group node first
      const groupId = "elements-group";
      nodes.push( {
        id: groupId,
        type: "group",
        data: { label: "Elements" },
        position: { x: groupX, y: groupY },
        style: {
          width: groupWidth,
          height: groupHeight,
          zIndex: 0
        },
        draggable: true,
        // Properly set the group as a container
        className: 'react-flow__node-group'
      } );

      // Create element nodes inside the group
      let elementIndex = 0;

      schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
        elementGroup.forEach( ( element, index ) => {
          const id = `element-${ groupIndex }-${ index }`;
          const elementLabel = element.name.split( "/" ).pop() || "Element";

          // Position relative to the group's top-left corner
          const xPos = groupPadding + ( elementIndex * ( elementWidth + elementSpacing ) );
          const yPos = groupPadding;

          elementIndex++;

          nodes.push( {
            id,
            type: "custom",
            data: {
              label: elementLabel,
              type: element.type,
              attributes: element.attributes
            },
            position: { x: xPos, y: yPos },
            parentNode: groupId,  // Set parent relationship
            extent: 'parent',     // Constrain to parent
            draggable: true,
            style: {
              width: elementWidth
            }
          } );

          // Connect to embed
          edges.push( {
            id: `embed-to-${ id }`,
            source: "embed-0",
            target: id,
            animated: true,
            style: { stroke: "#34d399" },
            type: 'smoothstep',
            zIndex: 0
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
