import * as React from "react";

// Interface for select menu options
interface SelectMenuOption {
  label: string;
  value: string;
  emoji?: string | { name: string; id?: string; animated?: boolean };
  default?: boolean;
  description?: string;
}

export interface DiscordSelectMenuProps {
  placeholder?: string;
  options?: SelectMenuOption[];
  minValues?: number;
  maxValues?: number;
  emoji?: { name: string; id?: string; animated?: boolean };
  disabled?: boolean;
  className?: string;
}

/**
 * Discord-styled select menu component
 */
export function DiscordSelectMenu( {
  placeholder = "Select an option",
  options = [],
  minValues = 0,
  maxValues = 1,
  emoji,
  disabled = false,
  className = "",
}: DiscordSelectMenuProps ) {
  return (
    <div
      className={`discord-select-menu ${ disabled ? "opacity-50 pointer-events-none" : "" } ${ className }`}
    >
      <div className="discord-select-menu-placeholder">
        {emoji && (
          <span className="discord-select-menu-emoji">
            {typeof emoji === "string" ? emoji : emoji.name}
          </span>
        )}
        <span>{placeholder}</span>
        <span className="discord-select-menu-arrow">▼</span>
      </div>
      {options.length > 0 && (
        <div className="discord-select-menu-options-preview">
          <span className="discord-select-menu-options-count">
            {minValues}-{maxValues} options
          </span>
        </div>
      )}
    </div>
  );
}
