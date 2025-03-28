import React from "react";

import { DiscordButton, ButtonStyle } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-button";
import { DiscordSelectMenu } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-select-menu";
import { DiscordRoleMenu } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-role-menu";
import { DiscordEmbed } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-embed";

// Interface for Discord embed attributes
interface DiscordEmbed {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  [key: string]: unknown;
}

// Extended interface to include all element types
interface ElementAttributes {
  type: number; // 2 for button, 3 for select menu, 6 for role menu
  style?: number; // For buttons
  label?: string; // For buttons
  emoji?: { name: string }; // For buttons
  disabled?: boolean;
  isDisabled?: boolean;
  custom_id?: string;
  placeholder?: string; // For select menus
  min_values?: number; // For select menus
  max_values?: number; // For select menus
  options?: Array<{ // For select menus
    label: string;
    value: string;
    emoji?: string;
    default?: boolean;
  }>;
  [key: string]: unknown; // Allow other properties
}

// Generic element interface
interface GenericElement {
  attributes: ElementAttributes;
}

// Base node data interface
interface BaseNodeData {
  id?: string;
  label: string;
  type: string;
}

// Component specific node data
interface ComponentNodeData extends BaseNodeData {
  type: "component";
  elements?: Array<{
    id: string;
    label: string;
    elements: Array<GenericElement>;
  }>;
  embeds?: Array<{
    id: string;
    label: string;
    attributes: DiscordEmbed;
  }>;
  childNodes?: Array<ExtendedNodeData>;
}

// Embed specific node data
interface EmbedNodeData extends BaseNodeData {
  type: "embed";
  attributes: DiscordEmbed;
}

// Element specific node data
interface ElementNodeData extends BaseNodeData {
  type: "element";
  attributes: {
    type: number;
    style: number;
    label: string;
    emoji?: { name: string };
    isDisabled?: boolean;
  };
}

// Row of elements
interface ElementsRowData extends BaseNodeData {
  type: "elements-row";
  elements: Array<ElementNodeData>;
}

// Group specific node data
interface GroupNodeData extends BaseNodeData {
  type: "group";
  groupType: string;
  childNodes?: Array<ExtendedNodeData>;
  elements?: Array<Array<GenericElement>>; // For elements groups
}

// Union type for all possible node types
export type ExtendedNodeData = ComponentNodeData | EmbedNodeData | GroupNodeData | ElementNodeData | ElementsRowData;

// Type guard functions
function isComponentNode( node: ExtendedNodeData ): node is ComponentNodeData {
  return node.type === "component";
}

function isEmbedNode( node: ExtendedNodeData ): node is EmbedNodeData {
  return node.type === "embed";
}

function isGroupNode( node: ExtendedNodeData ): node is GroupNodeData {
  return node.type === "group";
}

function isElementNode( node: ExtendedNodeData ): node is ElementNodeData {
  return node.type === "element";
}

function isElementsRowNode( node: ExtendedNodeData ): node is ElementsRowData {
  return node.type === "elements-row";
}

/**
 * DiscordNodeWrapper component provides consistent styling and structure for all Discord node types
 */
const DiscordNodeWrapper: React.FC<{ children: React.ReactNode }> = ( { children } ) => {
  return (
    <div className="discord-node-wrapper">
      {children}
    </div>
  );
};

/**
 * Render an element based on its type
 */
const renderElement = ( element: GenericElement, key: string ) => {
  const { attributes } = element;

  // Render different element types based on the 'type' attribute
  switch ( attributes.type ) {
    case 2: // Button
      return (
        <DiscordButton
          key={key}
          buttonStyle={attributes.style || ButtonStyle.Secondary}
          disabled={attributes.disabled || attributes.isDisabled}
        >
          {attributes.emoji && (
            <span>{attributes.emoji.name}</span>
          )}
          {attributes.label}
        </DiscordButton>
      );

    case 3: // Select Menu
      return (
        <DiscordSelectMenu
          key={key}
          placeholder={attributes.placeholder}
          options={attributes.options}
          minValues={attributes.min_values}
          maxValues={attributes.max_values}
          emoji={attributes.emoji}
          disabled={attributes.disabled || attributes.isDisabled}
        />
      );

    case 6: // Role Menu
      return (
        <DiscordRoleMenu
          key={key}
          placeholder={attributes.placeholder}
          minValues={attributes.min_values}
          maxValues={attributes.max_values}
          disabled={attributes.disabled || attributes.isDisabled}
        />
      );

    default:
      return <div key={key} className="discord-unknown-element">Unknown element type: {attributes.type}</div>;
  }
};

/**
 * DiscordNode component renders different types of Discord UI nodes based on their type
 */
export const DiscordNode: React.FC<{ data: ExtendedNodeData }> = ( { data } ) => {
  // For debugging
  console.log( "nodeData", data );

  // Handle the main component structure
  if ( isComponentNode( data ) ) {
    return (
      <DiscordNodeWrapper>
        <div className="discord-component">
          {/* Component Header */}
          <div className="discord-component-title">{data.label}</div>
          <div className="discord-component-type">{data.type}</div>

          {/* Render Embeds */}
          {data.embeds?.map( ( embed ) => (
            <DiscordEmbed
              key={embed.id}
              {...embed.attributes}
            />
          ) )}

          {/* Render Elements in rows */}
          <div className="discord-elements-container">
            {data.elements?.map( ( row ) => (
              <div key={row.id} className="discord-elements-row">
                {row.elements.map( ( element, elementIndex ) => (
                  renderElement( element, `${ row.id }-element-${ elementIndex }` )
                ) )}
              </div>
            ) )}
          </div>
        </div>
      </DiscordNodeWrapper>
    );
  }

  // For non-component nodes (when rendered individually)
  if ( isEmbedNode( data ) ) {
    return (
      <DiscordNodeWrapper>
        <DiscordEmbed {...data.attributes} />
      </DiscordNodeWrapper>
    );
  }

  if ( isElementNode( data ) ) {
    return (
      <DiscordButton
        buttonStyle={data.attributes.style || ButtonStyle.Secondary}
        disabled={!!data.attributes.isDisabled}
      >
        {data.attributes.emoji && (
          <span>{data.attributes.emoji.name}</span>
        )}
        {data.attributes.label}
      </DiscordButton>
    );
  }

  if ( isGroupNode( data ) || isElementsRowNode( data ) ) {
    return null; // These are handled within the component node
  }

  // Exhaustive type checking
  const _exhaustiveCheck: never = data;
  return _exhaustiveCheck;
};
