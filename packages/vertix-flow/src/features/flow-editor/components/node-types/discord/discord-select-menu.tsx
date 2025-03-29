import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { cva } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

// Discord emoji regex for parsing emoji strings like <:ChannelRename:1272447740034682952>
const DISCORD_EMOJI_REGEX = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/;

// Interface for Discord emoji
export interface DiscordEmoji {
  animated?: boolean;
  name: string;
  id?: string;
}

// Interface for select menu options
export interface DiscordSelectOption {
  label: string;
  value: string;
  emoji?: string | DiscordEmoji;
  description?: string;
  default?: boolean;
  disabled?: boolean;
}

// Interface for select menu configuration
export interface DiscordSelectConfig {
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

// Helper function to parse Discord emoji string
export function parseDiscordEmoji( emojiString: string ): DiscordEmoji | null {
  const match = emojiString.match( DISCORD_EMOJI_REGEX );
  if ( !match ) return null;

  const [ , animated, name, id ] = match;
  return {
    animated: !!animated,
    name,
    id
  };
}

// Helper function to render Discord emoji
export function renderDiscordEmoji( emoji: string | DiscordEmoji ): React.ReactNode {
  if ( typeof emoji === "string" ) {
    // If it's a Discord emoji string, parse it
    const parsedEmoji = parseDiscordEmoji( emoji );

    if ( parsedEmoji ) {
      if ( parsedEmoji.id ) {
        const url = `https://cdn.discordapp.com/emojis/${ parsedEmoji.id }.${ parsedEmoji.animated ? "gif" : "png" }`;
        return (
          <img
            src={url}
            alt={parsedEmoji.name}
            className="w-4 h-4 inline-block align-middle"
            onError={( e ) => {
              console.error( "Failed to load emoji:", url );
              e.currentTarget.style.display = "none";
            }}
          />
        );
      }
      return <span className="inline-block align-middle">{parsedEmoji.name}</span>;
    }
    // If it's a regular emoji, just render it
    return <span className="inline-block align-middle">{emoji}</span>;
  }

  // If it's already a DiscordEmoji object
  if ( emoji.id ) {
    const url = `https://cdn.discordapp.com/emojis/${ emoji.id }.${ emoji.animated ? "gif" : "png" }`;
    return (
      <img
        src={url}
        alt={emoji.name}
        className="w-4 h-4 inline-block align-middle"
        onError={( e ) => {
          console.error( "Failed to load emoji:", url );
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return <span className="inline-block align-middle">{emoji.name}</span>;
}

// Define variants for select menu trigger styling
const discordSelectTriggerVariants = cva(
  "discord-select-trigger relative flex w-[400px] flex-shrink-0 cursor-pointer rounded-md border border-[var(--discord-secondary-bg)] bg-[var(--discord-secondary-bg)] px-3 text-sm text-[#dcddde] transition-all hover:bg-[#36393f] focus:outline-none focus:ring-2 focus:ring-[#5865f2] focus:ring-offset-2 focus:ring-offset-[var(--discord-secondary-bg)] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        configuration: "bg-[#202225] border-[#202225] hover:bg-[#2f3136]"
      },
      size: {
        default: "min-h-[40px] py-2",
        sm: "min-h-[32px] py-1.5",
        lg: "min-h-[48px] py-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// Content styles
const discordSelectContentVariants = cva(
  "discord-select-content relative z-50 w-[400px] flex-shrink-0 overflow-hidden rounded-md border border-[#202225] bg-[var(--discord-secondary-bg)] shadow-lg",
  {
    variants: {
      variant: {
        default: "",
        configuration: "bg-[#202225]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Section styles
const discordSectionVariants = cva(
  "discord-section",
  {
    variants: {
      variant: {
        default: "",
        configuration: "bg-[#202225]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Main Discord Select Component
export interface DiscordSelectProps {
  options: Array<{
    label: string;
    value: string;
    emoji?: string | { name: string; id: string; animated?: boolean };
    description?: string;
    default?: boolean;
  }>;
  value?: string[];
  onChange?: ( value: string[] ) => void;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "configuration";
  size?: "default" | "sm" | "lg";
}

export const DiscordSelect = React.forwardRef<HTMLButtonElement, DiscordSelectProps>( ( {
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  minValues = 0,
  maxValues = 25,
  disabled = false,
  className,
  variant = "default",
  size = "default"
}, ref ) => {
  const [ isOpen, setIsOpen ] = useState( false );
  const [ selectedValues, setSelectedValues ] = useState<string[]>( value );

  useEffect( () => {
    setSelectedValues( value );
  }, [ value ] );

  const handleValueChange = ( optionValue: string, checked: boolean ) => {
    let newValues: string[];

    if ( checked ) {
      if ( selectedValues.length < maxValues ) {
        newValues = [ ...selectedValues, optionValue ];
      } else {
        return;
      }
    } else {
      if ( selectedValues.length > minValues ) {
        newValues = selectedValues.filter( v => v !== optionValue );
      } else {
        return;
      }
    }

    setSelectedValues( newValues );
    onChange?.( newValues );
  };

  const selectedOptions = options.filter( opt => selectedValues.includes( opt.value ) );

  // Group options by section (if they have descriptions)
  const sections = useMemo( () => {
    const withDesc = options.filter( opt => opt.description );
    const withoutDesc = options.filter( opt => !opt.description );

    return withDesc.length > 0 ? [ withoutDesc, withDesc ] : [ withoutDesc ];
  }, [ options ] );

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          ref={ref}
          className={cn( discordSelectTriggerVariants( { variant, size, className } ) )}
          disabled={disabled}
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="truncate flex items-center gap-2 flex-1">
              {selectedOptions.length > 0 ? (
                <span className="flex items-center flex-wrap gap-1">
                  {selectedOptions.map( ( opt ) => (
                    <span
                      key={opt.value}
                      className="flex items-center gap-1 min-w-0 px-1.5 py-0.5 rounded"
                    >
                      {opt.emoji && renderDiscordEmoji( opt.emoji )}
                      <span className="truncate">{opt.label}</span>
                    </span>
                  ) )}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50 ml-2" />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn( discordSelectContentVariants( { variant } ) )}
          align="start"
          sideOffset={4}
        >
          <div className="py-0">
            {sections.map( ( sectionOptions, index ) => (
              <div
                key={index}
                className={cn( discordSectionVariants( { variant } ) )}
              >
                <div className="grid grid-cols-3">
                  {sectionOptions.map( ( option ) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 hover:bg-[#36393f] cursor-pointer",
                        disabled && "opacity-50 cursor-not-allowed",
                        selectedValues.includes( option.value ) && "bg-[#36393f]"
                      )}
                      onClick={() => {
                        if ( !disabled ) {
                          handleValueChange(
                            option.value,
                            !selectedValues.includes( option.value )
                          );
                        }
                      }}
                    >
                      <Checkbox.Root
                        className="h-4 w-4 rounded border border-[#4f545c] bg-transparent data-[state=checked]:bg-[#5865f2] data-[state=checked]:border-[#5865f2] focus:outline-none"
                        checked={selectedValues.includes( option.value )}
                        disabled={disabled}
                        onCheckedChange={( checked ) => {
                          if ( !disabled ) {
                            handleValueChange( option.value, checked === true );
                          }
                        }}
                      >
                        <Checkbox.Indicator>
                          <Check className="h-3 w-3 text-white" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>

                      {option.emoji && (
                        <span className="flex-shrink-0">
                          {renderDiscordEmoji( option.emoji )}
                        </span>
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-[#dcddde] truncate">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-[#b9bbbe] truncate">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ) )}
                </div>
              </div>
            ) )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
} );

DiscordSelect.displayName = "DiscordSelect";

export default DiscordSelect;
