import { Position } from "reactflow";

import type { Node, Edge } from "reactflow";

import type { FlowSchema, FlowDiagram } from "@vertix.gg/flow/src/shared/types/flow";

// Factory interface for creating flow operations
export interface FlowFactory {
  createFlowDiagram( schema: FlowSchema ): FlowDiagram;
  createFlowInteraction( flowClass: any ): FlowInteractionController;
  createNodeStyle( nodeType: string ): Record<string, unknown>;
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
      type: "input",
      data: {
        label: rootLabel,
        type: schema.type
      },
      position: { x: 250, y: 50 },
      style: this.createNodeStyle( "root" )
    } );

    // Process embeds
    if ( schema.entities && schema.entities.embeds ) {
      schema.entities.embeds.forEach( ( embed, index ) => {
        const id = `embed-${ index }`;
        const embedLabel = embed.name.split( "/" ).pop() || "Embed";

        nodes.push( {
          id,
          type: "default",
          data: {
            label: embedLabel,
            type: "embed",
            attributes: embed.attributes
          },
          position: { x: 150, y: 150 + ( index * 100 ) },
          style: this.createNodeStyle( "embed" ),
          sourcePosition: Position.Right,
          targetPosition: Position.Left
        } );

        // Connect to root
        edges.push( {
          id: `root-to-${ id }`,
          source: "root",
          target: id,
          animated: true,
          style: { stroke: "#a78bfa" }
        } );
      } );
    }

    // Process elements
    if ( schema.entities && schema.entities.elements ) {
      schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
        elementGroup.forEach( ( element, index ) => {
          const id = `element-${ groupIndex }-${ index }`;
          const elementLabel = element.name.split( "/" ).pop() || "Element";

          const xPosition = 450 + ( groupIndex * 220 );
          nodes.push( {
            id,
            type: "default",
            data: {
              label: elementLabel,
              type: element.type,
              attributes: element.attributes
            },
            position: { x: xPosition, y: 150 + ( index * 100 ) },
            style: this.createNodeStyle( "element" ),
            sourcePosition: Position.Right,
            targetPosition: Position.Left
          } );

          // Connect to root
          edges.push( {
            id: `root-to-${ id }`,
            source: "root",
            target: id,
            animated: true,
            style: { stroke: "#34d399" }
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

  public createNodeStyle( nodeType: string ): Record<string, unknown> {
    // Base style common to all nodes
    const baseStyle = {
      borderRadius: "4px",
      padding: "10px",
      textAlign: "center" as const,
      minWidth: "150px",
    };

    // Type-specific styles
    switch ( nodeType ) {
      case "root":
        return {
          ...baseStyle,
          background: "#60a5fa",
          color: "white",
        };
      case "embed":
        return {
          ...baseStyle,
          background: "#a78bfa",
          color: "white",
          width: "180px",
        };
      case "element":
        return {
          ...baseStyle,
          background: "#34d399",
          color: "white",
          width: "180px",
        };
      default:
        return {
          ...baseStyle,
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  }
}

// Create a singleton instance
export const flowFactory = new DefaultFlowFactory();

// Helper function to access the factory
export function useFlowFactory(): FlowFactory {
  return flowFactory;
}
