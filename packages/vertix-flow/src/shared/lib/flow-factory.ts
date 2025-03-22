import type { Node, Edge } from "@xyflow/react";

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

    // Define canvas dimensions for relative positioning
    const canvasWidth = 1000;  // Default canvas width
    const canvasHeight = 800;  // Default canvas height

    // Calculate positions relative to canvas dimensions
    const centerX = canvasWidth / 2;
    const topPadding = canvasHeight * 0.05;  // 5% of canvas height from top

    // Create a parent "Components" group that will contain everything
    const componentsGroupId = "components-group";
    const componentsGroupPadding = 40; // Padding around all components

    // We'll determine the size after calculating all child nodes
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = 0;
    let maxY = 0;

    // Store nodes temporarily
    const tempNodes: Node[] = [];

    // Add root component node
    const rootLabel = schema.name.split( "/" ).pop() || "Component";
    const rootNodeWidth = 200;  // Estimated width
    const rootNodeHeight = 80;  // Estimated height

    // Position for root node
    const rootX = centerX - ( rootNodeWidth / 2 );
    const rootY = topPadding;

    // Update bounds
    minX = Math.min( minX, rootX );
    minY = Math.min( minY, rootY );
    maxX = Math.max( maxX, rootX + rootNodeWidth );
    maxY = Math.max( maxY, rootY + rootNodeHeight );

    tempNodes.push( {
      id: "root",
      type: "custom",
      data: {
        label: rootLabel,
        type: schema.type
      },
      position: {
        x: rootX,
        y: rootY
      },
      style: this.createNodeStyle(),
      draggable: true
    } );

    // Process embeds with their buttons
    let estimatedEmbedHeight = 0;
    const embedNodeWidth = 500;  // Estimated embed width
    const verticalGapBetweenNodes = canvasHeight * 0.08;  // 8% of canvas height

    if ( schema.entities && schema.entities.embeds ) {
      schema.entities.embeds.forEach( ( embed, index ) => {
        const id = `embed-${ index }`;
        const embedLabel = embed.name.split( "/" ).pop() || "Embed";

        // Estimate the embed's height based on its content
        const embedContentLength = JSON.stringify( embed.attributes ).length;
        // Base height plus additional height for content, relative to content size
        estimatedEmbedHeight = Math.max( canvasHeight * 0.25,
                                      300 + Math.min( 200, embedContentLength / 10 ) );

        // Position embed below root node with vertical gap
        const embedX = centerX - ( embedNodeWidth / 2 );
        const embedY = topPadding + rootNodeHeight + verticalGapBetweenNodes;

        // Update bounds
        minX = Math.min( minX, embedX );
        minY = Math.min( minY, embedY );
        maxX = Math.max( maxX, embedX + embedNodeWidth );
        maxY = Math.max( maxY, embedY + estimatedEmbedHeight );

        tempNodes.push( {
          id,
          type: "custom",
          data: {
            label: embedLabel,
            type: "embed",
            attributes: embed.attributes,
            elements: schema.entities.elements
          },
          position: {
            x: embedX,
            y: embedY
          },
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
      if ( totalElements > 0 ) {
        // Settings for element layout - based on relative sizes
        const elementWidth = Math.min( 160, canvasWidth / ( totalElements * 1.5 ) );
        const elementSpacing = elementWidth * 0.2;  // 20% of element width
        const groupPadding = elementWidth * 0.15;   // 15% of element width
        const elementHeight = elementWidth * 0.4;   // 40% of element width

        // Calculate group dimensions
        const groupWidth = ( elementWidth * totalElements ) +
                         ( elementSpacing * ( totalElements - 1 ) ) +
                         ( groupPadding * 2 );
        const groupHeight = elementHeight + ( groupPadding * 2 );

        // Calculate embed position values
        const embedY = topPadding + rootNodeHeight + verticalGapBetweenNodes;
        const embedBottomY = embedY + estimatedEmbedHeight;

        // Calculate vertical position relative to embed's bottom
        const relativeSpacing = canvasHeight * 0.06;  // 6% of canvas height
        const buttonAreaHeight = estimatedEmbedHeight * 0.2;  // 20% of embed height for buttons

        // Group position calculation
        const groupX = centerX - ( groupWidth / 2 );  // Center horizontally
        const groupY = embedBottomY + buttonAreaHeight + relativeSpacing;

        // Update bounds
        minX = Math.min( minX, groupX );
        minY = Math.min( minY, groupY );
        maxX = Math.max( maxX, groupX + groupWidth );
        maxY = Math.max( maxY, groupY + groupHeight );

        // Create group node
        const elementsGroupId = "elements-group";
        tempNodes.push( {
          id: elementsGroupId,
          type: "group",
          data: { label: "Elements" },
          position: { x: groupX, y: groupY },
          style: {
            width: groupWidth,
            height: groupHeight,
            zIndex: 0
          },
          draggable: true,
          className: 'react-flow__node-group'
        } );

        // Create element nodes inside the group with relative positioning
        let elementIndex = 0;

        schema.entities.elements.forEach( ( elementGroup, groupIndex ) => {
          elementGroup.forEach( ( element, index ) => {
            const id = `element-${ groupIndex }-${ index }`;
            const elementLabel = element.name.split( "/" ).pop() || "Element";

            // Calculate relative position within the group
            const xPos = groupPadding + ( elementIndex * ( elementWidth + elementSpacing ) );
            const yPos = groupPadding; // Centered vertically in group

            elementIndex++;

            tempNodes.push( {
              id,
              type: "custom",
              data: {
                label: elementLabel,
                type: element.type,
                attributes: element.attributes
              },
              position: { x: xPos, y: yPos },
              parentId: elementsGroupId,
              extent: 'parent',
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
    }

    // Calculate the components group dimensions with padding
    const componentsGroupWidth = ( maxX - minX ) + ( componentsGroupPadding * 2 );
    const componentsGroupHeight = ( maxY - minY ) + ( componentsGroupPadding * 2 );

    // Add the parent components group first
    nodes.push( {
      id: componentsGroupId,
      type: "group",
      data: { label: "Components" },
      position: {
        x: minX - componentsGroupPadding,
        y: minY - componentsGroupPadding
      },
      style: {
        width: componentsGroupWidth,
        height: componentsGroupHeight,
        zIndex: -1,
        backgroundColor: 'rgba(245, 247, 250, 0.1)',
        border: '1px dashed #9ca3af'
      },
      draggable: true,
      className: 'react-flow__node-group'
    } );

    // Now add all temporary nodes as children of the components group
    tempNodes.forEach( node => {
      if ( node.id !== componentsGroupId ) {
        // Adjust position to be relative to the parent group
        const offsetX = node.position.x - ( minX - componentsGroupPadding );
        const offsetY = node.position.y - ( minY - componentsGroupPadding );

        // For non-nested groups, set the parent
        if ( !node.parentId ) {
          node.parentId = componentsGroupId;
          node.position = { x: offsetX, y: offsetY };
          node.extent = 'parent';
        }
      }

      // Add the node to the final nodes array
      nodes.push( node );
    } );

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
