import React from "react";

import { DiscordNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord-node";
import { GroupNode } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/group-node";

import type { APIMessageActionRowComponent } from "discord-api-types/v10";
import type { ExtendedNodeData } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord-node";

// Base node interface
interface BaseNode {
  id: string;
  label: string;
  type: string;
}

// Component specific node
interface ComponentNode extends BaseNode {
  type: "component";
  elements?: Array<{
    id: string;
    label: string;
    elements: Array<{
      id: string;
      label: string;
      type: string;
      attributes: APIMessageActionRowComponent;
    }>;
  }>;
  embeds?: Array<{
    id: string;
    label: string;
    attributes: {
      title?: string;
      description?: string;
      thumbnail?: { url: string };
      image?: { url: string };
      [key: string]: unknown;
    };
  }>;
  childNodes?: Array<ChildNode>;
}

// Embed specific node
interface EmbedNode extends BaseNode {
  type: "embed";
  attributes: {
    title?: string;
    description?: string;
    thumbnail?: { url: string };
    image?: { url: string };
    [key: string]: unknown;
  };
}

// Group specific node
interface GroupNode extends BaseNode {
  type: "group";
  groupType: string;
  childNodes?: Array<ChildNode>;
}

// Element specific node
interface ElementNode extends BaseNode {
  type: "element";
  attributes: APIMessageActionRowComponent;
}

// Union type for all possible child nodes
type ChildNode = ComponentNode | EmbedNode | GroupNode | ElementNode;

export interface CompoundNodeData extends BaseNode {
  type: string;
  groupType?: string;
  childNodes?: Array<ChildNode>;
}

export interface CompoundNodeProps {
  data: CompoundNodeData;
}

/**
 * CompoundNode component that can handle nesting of elements in DOM
 */
export const CompoundNode: React.FC<CompoundNodeProps> = ( { data } ) => {
  const { label, type = "compound", groupType, childNodes } = data;
  const isElementsGroup = groupType === "Elements";
  const isComponentsGroup = groupType === "Components";

  // Render a standard node if not a group
  if ( type !== "group" && type !== "compound" ) {
    // Convert the data to the appropriate ExtendedNodeData type
    const { id, ...restData } = data;
    const nodeData: ExtendedNodeData = {
      ...( restData as ChildNode ),
      id: id || "default-id" // Fallback ID if not provided
    };

    return <DiscordNode data={nodeData} />;
  }

  // For groups, render a container with child nodes nested inside
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
              <CompoundNode data={child} />
            ) : (
              // Render regular nodes with proper typing
              <DiscordNode data={child as ExtendedNodeData} />
            )}
          </div>
        );
      } )
    }} />
  );
};
