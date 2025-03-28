import React from "react";

import { DiscordButton, ButtonStyle } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-button";

// Interface for Discord embed attributes
interface DiscordEmbed {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  [key: string]: unknown;
}

// Interface for element attributes (base)
interface BaseElementAttributes {
  type: number;
  custom_id?: string;
}

// Button element attributes
interface ButtonElementAttributes extends BaseElementAttributes {
  type: 2;
  style: number;
  label: string;
  emoji?: { name: string; animated?: boolean };
  disabled?: boolean;
}

// Select menu option
interface SelectMenuOption {
  label: string;
  value: string;
  emoji?: string;
  default?: boolean;
}

// Select menu element attributes
interface SelectMenuElementAttributes extends BaseElementAttributes {
  type: 3;
  placeholder?: string;
  options: SelectMenuOption[];
  min_values?: number;
  max_values?: number;
}

// Role selector element attributes
interface RoleSelectorElementAttributes extends BaseElementAttributes {
  type: 6;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
}

// Union type for all element attributes
type ElementAttributes = ButtonElementAttributes | SelectMenuElementAttributes | RoleSelectorElementAttributes;

// Interface for element
interface ButtonElement {
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
    elements: Array<ButtonElement>;
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
  attributes: ElementAttributes;
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
  elements?: Array<Array<ButtonElement>>; // For elements groups
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
 * DiscordEmbed component renders a Discord embed without buttons
 */
const DiscordEmbed: React.FC<{
  attributes: DiscordEmbed;
}> = ( { attributes } ) => {
  return (
    <div className="discord-embed">
      {/* Main embed content */}
      <div className="discord-embed-content">
        {/* Embed Header */}
        <div className="discord-embed-title">{attributes?.title}</div>

        {/* Embed Description */}
        {attributes?.description && (
          <div className="discord-embed-description">
            {attributes.description}
          </div>
        )}

        {/* Embed Thumbnail */}
        {attributes?.thumbnail?.url && (
          <div className="discord-embed-thumbnail">
            <img
              src={attributes.thumbnail.url}
              alt="Thumbnail"
            />
          </div>
        )}

        {/* Embed Image */}
        {attributes?.image?.url && (
          <div className="discord-embed-image">
            <img
              src={attributes.image.url}
              alt="Embed"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Renders a Discord select menu
 */
const DiscordSelectMenu: React.FC<{
  attributes: SelectMenuElementAttributes;
}> = ( { attributes } ) => {
  return (
    <div className="discord-select-menu">
      <div className="discord-select-placeholder">
        {attributes.placeholder || "Select an option"}
        <span className="discord-select-chevron">▼</span>
      </div>
      <div className="discord-select-tooltip">
        <div className="discord-select-options">
          {attributes.options?.map( ( option, index ) => (
            <div key={index} className={`discord-select-option ${ option.default ? "selected" : "" }`}>
              {option.emoji && <span className="discord-select-option-emoji">{option.emoji}</span>}
              <span className="discord-select-option-label">{option.label}</span>
            </div>
          ) )}
        </div>
      </div>
    </div>
  );
};

/**
 * Renders a Discord role selector
 */
const DiscordRoleSelector: React.FC<{
  attributes: RoleSelectorElementAttributes;
}> = ( { attributes } ) => {
  return (
    <div className="discord-role-selector">
      <div className="discord-select-placeholder">
        {attributes.placeholder || "Select roles"}
        <span className="discord-select-chevron">▼</span>
      </div>
    </div>
  );
};

/**
 * Renders the appropriate element based on its type
 */
const renderElement = ( element: ButtonElement, key: string ) => {
  const attributes = element.attributes;
  if ( !attributes ) {
    return null;
  }

  // Check the type property and render accordingly
  if ( "type" in attributes ) {
    switch ( attributes.type ) {
      case 2: // Button
        if ( "style" in attributes && "label" in attributes ) {
          return (
            <DiscordButton
              key={key}
              buttonStyle={attributes.style || ButtonStyle.Secondary}
              disabled={!!attributes.disabled}
            >
              {attributes.emoji && (
                <span>{attributes.emoji.name}</span>
              )}
              {attributes.label}
            </DiscordButton>
          );
        }
        break;

      case 3: // Select Menu
        if ( "options" in attributes ) {
          return (
            <DiscordSelectMenu
              key={key}
              attributes={attributes as SelectMenuElementAttributes}
            />
          );
        }
        break;

      case 6: // Role Selector
        return (
          <DiscordRoleSelector
            key={key}
            attributes={attributes as RoleSelectorElementAttributes}
          />
        );
    }
  }

  // Fallback for unsupported types
  return <div key={key}>Unsupported element</div>;
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
            <DiscordEmbed key={embed.id} attributes={embed.attributes} />
          ) )}

          {/* Render Elements in rows */}
          <div className="discord-elements-container">
            {data.elements?.map( ( row ) => (
              <div key={row.id} className="discord-button-row">
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
        <DiscordEmbed attributes={data.attributes} />
      </DiscordNodeWrapper>
    );
  }

  if ( isElementNode( data ) ) {
    // Use the renderElement function to handle element based on its type
    return renderElement(
      { attributes: data.attributes },
      data.id || "element"
    );
  }

  if ( isGroupNode( data ) || isElementsRowNode( data ) ) {
    return null; // These are handled within the component node
  }

  // Exhaustive type checking
  const _exhaustiveCheck: never = data;
  return _exhaustiveCheck;
};
