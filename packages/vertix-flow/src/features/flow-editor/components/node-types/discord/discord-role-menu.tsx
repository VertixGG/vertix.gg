import * as React from "react";

export interface DiscordRoleMenuProps {
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Discord-styled role select menu component
 */
export function DiscordRoleMenu( {
  placeholder = "Select roles",
  minValues = 0,
  maxValues = 1,
  disabled = false,
  className = "",
}: DiscordRoleMenuProps ) {
  return (
    <div
      className={`discord-role-menu ${ disabled ? "opacity-50 pointer-events-none" : "" } ${ className }`}
    >
      <div className="discord-role-menu-placeholder">
        <span className="discord-role-menu-icon">@</span>
        <span>{placeholder}</span>
        <span className="discord-role-menu-arrow">▼</span>
      </div>
      <div className="discord-role-menu-options-preview">
        <span className="discord-role-menu-options-count">
          {minValues}-{maxValues} roles
        </span>
      </div>
    </div>
  );
}
