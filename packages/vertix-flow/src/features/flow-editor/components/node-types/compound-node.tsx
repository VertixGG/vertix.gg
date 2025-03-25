import React from "react";

import { CustomNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/custom-node";
import { GroupNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/group-node";

import type { ExtendedNodeData } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/custom-node";

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
  const { label, type = "compound", groupType, childNodes, attributes, elements } = data;
  const isElementsGroup = groupType === "Elements";
  const isComponentsGroup = groupType === "Components";

  // Render a standard node if not a group
  if ( type !== "group" && type !== "compound" ) {
    return <CustomNode data={{ label, type, attributes, elements } as ExtendedNodeData} />;
  }

  // For groups, render a container with child nodes nested inside

  // Special case for flow-group with Components childNodes
  if ( data.id === "flow-group" ) {
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
        } else if ( isComponentsGroup ) {
          // Apply specific styling for each component in the group
          if ( child.id.endsWith( "-root" ) ) {
            className = "mb-6"; // Top component
          } else if ( child.id.includes( "-embed-" ) ) {
            className = "mb-8 mt-2"; // Middle embed (more space)
          } else if ( child.id.endsWith( "-elements-group" ) ) {
            className = "mb-2"; // Elements group
          } else {
            className = "mb-2"; // Default spacing
          }
        } else {
          className = "mb-2 last:mb-0"; // Default vertical spacing
        }

        return (
          <div key={child.id} className={className}>
            {child.type === "group" ? (
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
