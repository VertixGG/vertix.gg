import React from "react";
import { CustomNode, ExtendedNodeData } from "./custom-node";
import { GroupNode } from "./group-node";

interface ChildNode {
  id: string;
  label: string;
  type: string;
  attributes?: Record<string, unknown>;
  elements?: Array<Array<any>>;
  groupType?: string;
  childNodes?: Array<ChildNode>;
}

export interface CompoundNodeData {
  id?: string;
  label: string;
  type: string;
  groupType?: string;
  attributes?: Record<string, unknown>;
  elements?: Array<Array<any>>;
  childNodes?: Array<ChildNode>;
}

export interface CompoundNodeProps {
  data: CompoundNodeData;
}

/**
 * CompoundNode component that can handle nesting of elements in DOM
 */
export const CompoundNode: React.FC<CompoundNodeProps> = ( { data } ) => {
  const { label, type = 'compound', groupType, childNodes, attributes, elements } = data;
  const isElementsGroup = groupType === "Elements";
  const isComponentsGroup = groupType === "Components";

  console.log(`[DEBUG] Rendering CompoundNode:`, {
    label,
    type,
    groupType,
    isElementsGroup,
    isComponentsGroup,
    hasChildNodes: !!childNodes,
    childNodesCount: childNodes?.length,
    childNodeIds: childNodes?.map(n => n.id),
    dataKeys: Object.keys(data)
  });

  // Render a standard node if not a group
  if ( type !== 'group' && type !== 'compound' ) {
    console.log(`[DEBUG] Rendering as CustomNode`);
    return <CustomNode data={{ label, type, attributes, elements } as ExtendedNodeData} />;
  }

  // For groups, render a container with child nodes nested inside
  console.log(`[DEBUG] Rendering as GroupNode with ${childNodes?.length || 0} children`);

  // Special case for flow-group with Components childNodes
  if (data.id === 'flow-group') {
    console.log(`[DEBUG] Special handling for flow-group:`, data.childNodes);
  }

  return (
    <GroupNode data={{
      label,
      groupType,
      children: childNodes?.map( ( child ) => {
        // Add specific classes based on the node's position in the Components group
        let className = "";
        if ( isElementsGroup ) {
          className = "inline-block"; // Horizontal layout for Elements
          console.log(`[DEBUG] Elements group child:`, {
            id: child.id,
            label: child.label,
            type: child.type
          });
        } else if ( isComponentsGroup ) {
          // Apply specific styling for each component in the group
          if ( child.id.endsWith("-root") ) {
            className = "mb-6"; // Top component
            console.log(`[DEBUG] Found root component:`, {
              id: child.id,
              label: child.label
            });
          } else if ( child.id.includes("-embed-") ) {
            className = "mb-8 mt-2"; // Middle embed (more space)
            console.log(`[DEBUG] Found embed:`, {
              id: child.id,
              label: child.label
            });
          } else if ( child.id.endsWith("-elements-group") ) {
            className = "mb-2"; // Elements group
            console.log(`[DEBUG] Found elements group:`, {
              id: child.id,
              label: child.label,
              childNodes: child.childNodes?.length
            });
          } else {
            className = "mb-2"; // Default spacing
            console.log(`[DEBUG] Unknown component child:`, {
              id: child.id,
              label: child.label,
              type: child.type
            });
          }
        } else {
          className = "mb-2 last:mb-0"; // Default vertical spacing
        }

        return (
          <div key={child.id} className={className}>
            {child.type === 'group' ? (
              // Recursively render nested groups
              <CompoundNode data={{
                label: child.label,
                type: child.type,
                groupType: child.groupType,
                childNodes: child.childNodes,
                attributes: child.attributes,
                elements: child.elements
              }} />
            ) : (
              // Render regular nodes
              <CustomNode data={child as ExtendedNodeData} />
            )}
          </div>
        );
      } )
    }} />
  );
};
