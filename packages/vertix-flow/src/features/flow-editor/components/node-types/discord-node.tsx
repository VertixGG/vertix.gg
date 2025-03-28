import React, { useState, useEffect, useMemo } from "react";

// Import directly from discord-api-types
import {
  ComponentType,
  ButtonStyle
} from "discord-api-types/v10";

import { DiscordButton } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-button";
import { DiscordSelect } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-select-menu";
import { DiscordRoleMenu } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-role-menu";
import { DiscordEmbed } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-embed";
import { cn } from "@vertix.gg/flow/src/lib/utils";

import type {
  APIButtonComponent,
  APIStringSelectComponent,
  APIRoleSelectComponent,
  APIMessageActionRowComponent,
  APISelectMenuOption
} from "discord-api-types/v10";

// Interface for Discord embed attributes
interface DiscordEmbed {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  [key: string]: unknown;
}

// Generic element interface using Discord API types
interface GenericElement {
  attributes: APIMessageActionRowComponent;
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
  attributes: APIMessageActionRowComponent;
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

// Type guard functions for node types
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

// Type guards for component types
function isButtonComponent( component: APIMessageActionRowComponent ): component is APIButtonComponent {
  return component.type === ComponentType.Button;
}

function isStringSelectComponent( component: APIMessageActionRowComponent ): component is APIStringSelectComponent {
  return component.type === ComponentType.StringSelect;
}

function isRoleSelectComponent( component: APIMessageActionRowComponent ): component is APIRoleSelectComponent {
  return component.type === ComponentType.RoleSelect;
}

// Helper function to safely get label from button components
function getButtonLabel( button: APIButtonComponent ): string | undefined {
  // Check if it's a URL button or CustomId button which both have labels
  if ( "url" in button || "custom_id" in button ) {
    // These button types have labels
    return "label" in button ? button.label : undefined;
  }
  return undefined; // For SKU buttons or unknown types
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

// Create a separate component for the select menu
const DiscordSelectWrapper: React.FC<{
  options: APISelectMenuOption[];
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  className?: string;
}> = ( {
  options,
  placeholder,
  minValues = 0,
  maxValues = 1,
  disabled,
  className
} ) => {
  // Memoize the options conversion to prevent unnecessary recalculations
  const selectOptions = useMemo( () =>
    options.map( option => ( {
      label: option.label,
      value: option.value,
      description: option.description,
      default: option.default,
      emoji: option.emoji
    } ) )
  , [ options ] );

  // Get default values from options marked as default
  const defaultValues = useMemo( () =>
    selectOptions
      .filter( option => option.default )
      .map( option => option.value )
  , [ selectOptions ] );

  // Use React's useState hook with defaultValues
  const [ selectedValues, setSelectedValues ] = useState<string[]>( defaultValues );

  // Update selected values when options change
  useEffect( () => {
    // Only update if we have default values
    if ( defaultValues.length > 0 ) {
      setSelectedValues( prevValues => {
        // Keep existing selections if they're still valid options
        const validPrevValues = prevValues.filter( value =>
          selectOptions.some( opt => opt.value === value )
        );

        // Combine with new defaults, ensuring no duplicates
        return Array.from( new Set( [ ...validPrevValues, ...defaultValues ] ) );
      } );
    }
  }, [ defaultValues, selectOptions ] );

  // Memoize the onChange handler
  const handleChange = useMemo( () =>
    ( values: string[] ) => {
      // Ensure we respect min/max values
      if ( values.length >= minValues && values.length <= maxValues ) {
        setSelectedValues( values );
      }
    }
  , [ minValues, maxValues ] );

  return (
    <DiscordSelect
      className={className}
      options={selectOptions}
      placeholder={placeholder}
      minValues={minValues}
      maxValues={maxValues}
      disabled={disabled}
      value={selectedValues}
      onChange={handleChange}
    />
  );
};

/**
 * Render an element based on its type
 */
const renderElement = ( element: GenericElement, key: string ) => {
  const { attributes } = element;

  if ( isButtonComponent( attributes ) ) {
    return (
      <DiscordButton
        key={key}
        className="nodrag"
        buttonStyle={Number( attributes.style ) || ButtonStyle.Secondary}
        disabled={!!attributes.disabled}
      >
        {getButtonLabel( attributes )}
      </DiscordButton>
    );
  }

  if ( isStringSelectComponent( attributes ) ) {
    return (
      <DiscordSelectWrapper
        key={key}
        className="nodrag"
        options={attributes.options || []}
        placeholder={attributes.placeholder || "Select..."}
        minValues={attributes.min_values}
        maxValues={attributes.max_values}
        disabled={!!attributes.disabled}
      />
    );
  }

  if ( isRoleSelectComponent( attributes ) ) {
    return (
      <DiscordRoleMenu
        key={key}
        className={cn( "flex-1", "nodrag" )}
        placeholder={attributes.placeholder || ""}
        minValues={attributes.min_values || 0}
        maxValues={attributes.max_values || 1}
        disabled={!!attributes.disabled}
      />
    );
  }

  // For other component types, show a simple representation with safe type access
  return (
    <div key={key} className="discord-unknown-element flex-1">
      Unknown element type: {attributes ? ComponentType[ attributes.type ] || "unknown" : "unknown"}
    </div>
  );
};

/**
 * DiscordNode component renders different types of Discord UI nodes based on their type
 */
export const DiscordNode: React.FC<{ data: ExtendedNodeData }> = ( { data } ) => {
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
    if ( isButtonComponent( data.attributes ) ) {
      return (
        <DiscordButton
          buttonStyle={Number( data.attributes.style ) || ButtonStyle.Secondary}
          disabled={!!data.attributes.disabled}
        >
          {getButtonLabel( data.attributes )}
        </DiscordButton>
      );
    }

    // Handle other element types if needed
    return null;
  }

  if ( isGroupNode( data ) || isElementsRowNode( data ) ) {
    return null; // These are handled within the component node
  }

  // For the exhaustive check, return null for any unsupported types
  return null;
};
