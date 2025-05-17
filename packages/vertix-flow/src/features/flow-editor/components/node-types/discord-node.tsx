import React, { useState, useEffect, useMemo } from "react";

import { ButtonStyle } from "discord-api-types/v10";

import { DiscordButton } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-button";
import { DiscordSelect } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-select-menu";
import { DiscordRoleMenu } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-role-menu";
import { DiscordEmbed } from "@vertix.gg/flow/src/features/flow-editor/components/node-types/discord/discord-embed";

import {
  isButtonComponent,
  isStringSelectComponent,
  isRoleSelectComponent
} from "@vertix.gg/flow/src/features/flow-editor/types";

import { calculateHandlePosition } from "@vertix.gg/flow/src/features/flow-editor/utils/calculate-node-handle-position";

import type { APISelectMenuOption, APIMessageComponentEmoji, APIButtonComponentWithCustomId, APIButtonComponentWithURL } from "discord-api-types/v10";

import type {
  ExtendedNodeData,
  RenderableElementData
} from "@vertix.gg/flow/src/features/flow-editor/types";

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
  const convertEmoji = ( emoji: APIMessageComponentEmoji | undefined ) => {
    if ( !emoji ) return undefined;

    if ( typeof emoji === "string" ) return emoji;

    if ( emoji.name && emoji.id ) {
      return {
        name: emoji.name,
        id: emoji.id,
        animated: emoji.animated
      };
    }

    return emoji.name || undefined;
  };

  const selectOptions = useMemo( () =>
    options.map( option => ( {
      label: option.label,
      value: option.value,
      description: option.description,
      default: option.default,
      emoji: convertEmoji( option.emoji )
    } ) )
  , [ options ] );

  const defaultValues = useMemo( () =>
    selectOptions
      .filter( option => option.default )
      .map( option => option.value )
  , [ selectOptions ] );

  const [ selectedValues, setSelectedValues ] = useState<string[]>( defaultValues );

  useEffect( () => {
    if ( defaultValues.length > 0 ) {
      setSelectedValues( prevValues => {
        const validPrevValues = prevValues.filter( value =>
          selectOptions.some( opt => opt.value === value )
        );
        return Array.from( new Set( [ ...validPrevValues, ...defaultValues ] ) );
      } );
    }
  }, [ defaultValues, selectOptions ] );

  const handleChange = useMemo( () =>
    ( values: string[] ) => {
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
 * Context needed for rendering an element, including its position within the node structure.
 */
interface RenderElementContext {
  rowIndex: number;
  totalRows: number;
  elementIndex: number;
  elementsCount: number;
}

/**
 * Render an element based on its type
 * Accepts RenderableElementData which includes the ID and context for handle positioning.
 */
const renderElement = (
  elementData: RenderableElementData,
  key: string,
  context: RenderElementContext
) => {
  const { id, attributes } = elementData;
  const isButton = isButtonComponent( attributes );

  // Calculate handle position using the utility function
  const handlePosition = calculateHandlePosition( {
    isButton,
    rowIndex: context.rowIndex,
    totalRows: context.totalRows,
    elementIndex: context.elementIndex,
    elementsCount: context.elementsCount
  } );

  if ( isButton ) {
    const buttonLabel = ( () => {
      if ( "custom_id" in attributes ) {
        return ( attributes as APIButtonComponentWithCustomId ).label || "Button";
      }
      if ( "url" in attributes ) {
        return ( attributes as APIButtonComponentWithURL ).label || "Link";
      }
      return "Button";
    } )();

    // Extract URL if it exists (only link buttons have it)
    const buttonUrl = ( attributes as APIButtonComponentWithURL ).url;

    return (
      <DiscordButton
        key={key}
        elementId={id}
        className="nodrag"
        buttonStyle={Number( attributes.style ) || ButtonStyle.Secondary}
        disabled={!!attributes.disabled}
        handlePosition={handlePosition}
        url={buttonUrl}
      >
        {buttonLabel}
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
        className="nodrag"
        placeholder={attributes.placeholder || "Select Role..."}
        minValues={attributes.min_values}
        maxValues={attributes.max_values}
        disabled={!!attributes.disabled}
      />
    );
  }

  return null;
};

/**
 * DiscordNode component renders different types of Discord UI nodes based on their type
 */
export const DiscordNode: React.FC<{ data: ExtendedNodeData }> = ( { data } ) => {
  if ( data.type === "embed" ) {
    // Extract potential thumbnail URL directly from the embed attributes
    const thumbnailUrl = data.attributes?.thumbnail?.url;

    return (
      <DiscordNodeWrapper>
        {/* Add a relative container for absolute positioning of the thumbnail */}
        <div className="relative">
          {/* Render the embed, passing all attributes EXCEPT the thumbnail */}
          <DiscordEmbed {...( { ...data.attributes, thumbnail: undefined } )} />
          {/* Render the thumbnail separately if it exists, positioned top-right */}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="absolute top-4 right-4 h-16 w-16 rounded-full object-cover"
            />
          )}
        </div>
      </DiscordNodeWrapper>
    );
  }

  if ( data.type === "component" ) {
    // Type for a row within ComponentNodeData.elements
    type ComponentRowData = {
      id: string;
      label: string;
      elements: RenderableElementData[];
    };

    const totalRows = data.elements?.length || 0;

    return (
      <DiscordNodeWrapper>
        <div className="discord-component bg-background/50 p-2 rounded">
          {data.embeds?.map( ( embed ) => {
            // Extract potential thumbnail URL from each embed's attributes
            const thumbnailUrl = embed.attributes?.thumbnail?.url;
            return (
              // Add a relative container for absolute positioning of the thumbnail
              <div key={embed.id} className="relative mb-2"> {/* Add margin-bottom if multiple embeds */}
                {/* Render the embed, passing all attributes EXCEPT the thumbnail */}
                <DiscordEmbed {...( { ...embed.attributes, thumbnail: undefined } )} />
                {/* Render the thumbnail separately if it exists, positioned top-right */}
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="absolute top-4 right-4 h-16 w-16 rounded-full object-cover"
                  />
                )}
              </div>
            );
          } )}

          {/* Interactive components rendering remains the same */}
          {data.elements?.map( ( row: ComponentRowData, rowIndex: number ) => {
            const elementsCount = row.elements?.length || 0;
            return (
              <div key={row.id} className="discord-action-row my-1 flex flex-wrap gap-2">
                {/* Inner map uses RenderableElementData, which is correct */}
                {row.elements?.map( ( element: RenderableElementData, elementIndex: number ) =>
                  renderElement( element, element.id, {
                    rowIndex,
                    totalRows,
                    elementIndex,
                    elementsCount
                  } )
                )}
              </div>
            );
          } )}
        </div>
      </DiscordNodeWrapper>
    );
  }

  if ( data.type === "group" ) {
    return (
       <DiscordNodeWrapper>
          <div className="p-2 font-semibold text-gray-400">Group: {data.label}</div>
       </DiscordNodeWrapper>
    );
  }

  return (
      <DiscordNodeWrapper>
        <div className="p-1 text-xs text-gray-500">Node: {data.label} ({data.type})</div>
      </DiscordNodeWrapper>
  );
};
