import React, { useState, useEffect, useMemo } from "react";
// Remove unused Handle, Position
// import { Handle, Position } from "@xyflow/react";

// Import directly from discord-api-types
import {
  ComponentType,
  ButtonStyle
} from "discord-api-types/v10";

import { DiscordButton } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-button";
import { DiscordSelect } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-select-menu";
import { DiscordRoleMenu } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-role-menu";
import { DiscordEmbed } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-embed";
// Remove unused cn
// import { cn } from "@vertix.gg/flow/src/lib/utils";

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

// Interface for the element data structure created by flow-factory
// This should match the structure within ComponentNodeData.elements[row].elements
interface RenderableElementData {
  id: string; // This is the element.name
  label: string;
  type: string;
  attributes: APIMessageActionRowComponent;
}

// Component specific node data
interface ComponentNodeData extends BaseNodeData {
  type: "component";
  elements?: Array<{
    id: string; // Row ID
    label: string; // Row Label
    // Correct the type for the inner elements array
    elements: Array<RenderableElementData>;
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
 * Accepts RenderableElementData which includes the ID
 */
const renderElement = ( elementData: RenderableElementData, key: string ) => {
  // Destructure id and attributes from the element data
  const { id, attributes } = elementData;

  if ( isButtonComponent( attributes ) ) {
    return (
      <DiscordButton
        key={key}
        elementId={id} // Pass the ID (element name) to the button
        className="nodrag" // Prevent dragging the node when interacting with button
        buttonStyle={Number( attributes.style ) || ButtonStyle.Secondary}
        disabled={!!attributes.disabled}
      >
        {getButtonLabel( attributes )}
      </DiscordButton>
    );
  }

  if ( isStringSelectComponent( attributes ) ) {
    // Select menus likely don't need source handles for flow connections
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
     // Select menus likely don't need source handles for flow connections
    return (
      <DiscordRoleMenu
        key={key}
        className="nodrag"
        placeholder={attributes.placeholder || "Select Role..."}
        minValues={attributes.min_values}
        maxValues={attributes.max_values}
        disabled={!!attributes.disabled}
        // default_values might need mapping if required
      />
    );
  }

  // Add other element types if necessary

  return null; // Fallback for unknown element types
};

/**
 * DiscordNode component renders different types of Discord UI nodes based on their type
 */
export const DiscordNode: React.FC<{ data: ExtendedNodeData }> = ( { data } ) => {
  if ( isEmbedNode( data ) ) {
    // Renders only an embed
    return (
      <DiscordNodeWrapper>
        <DiscordEmbed attributes={data.attributes} />
      </DiscordNodeWrapper>
    );
  }

  if ( isComponentNode( data ) ) {
    // Renders a component, which contains embeds and element rows
    return (
      <DiscordNodeWrapper>
        {/* Add back a container div for the component itself */}
        <div className="discord-component bg-background/50 p-2 rounded"> {/* Example class + basic styling */}
          {/* Render Embeds first if they exist inside the component container*/}
          {data.embeds?.map( ( embed ) => (
            <DiscordEmbed key={embed.id} {...embed.attributes} />
          ) )}

          {/* Render Element Rows inside the component container */}
          {data.elements?.map( ( row ) => (
            <div key={row.id} className="discord-action-row my-1 flex flex-wrap gap-2">
              {row.elements?.map( ( element ) =>
                renderElement( element, element.id )
              )}
            </div>
          ) )}
        </div>
      </DiscordNodeWrapper>
    );
  }

  if ( isGroupNode( data ) ) {
    // If it's explicitly a group node (not compound rendered via CompoundNode),
    // render its label. Handles/connections typically managed by CompoundNode or specific layout.
    return (
       <DiscordNodeWrapper>
          <div className="p-2 font-semibold text-gray-400">Group: {data.label}</div>
          {/* We might need to render childNodes here if groups can contain non-group children directly */}
       </DiscordNodeWrapper>
    );
  }

  // Handle other potential types if necessary

  // Fallback or render a simple label
  return (
      <DiscordNodeWrapper>
        <div className="p-1 text-xs text-gray-500">Node: {data.label} ({data.type})</div>
      </DiscordNodeWrapper>
  );
};
