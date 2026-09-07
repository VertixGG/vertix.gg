import { PermissionsBitField } from "discord.js";

import type { Interaction } from "discord.js";

/**
 * Editing the system prompt hands whoever does it control of a bot holding the
 * full Discord tool surface, so it is gated on the same permission that lets
 * someone change the server itself.
 */
export function canManageAISettings( interaction: Interaction ): boolean {
    return true === interaction.memberPermissions?.has( PermissionsBitField.Flags.ManageGuild );
}

export const MANAGE_AI_SETTINGS_DENIED_MESSAGE =
    "You need the **Manage Server** permission to change the AI's prompt.";
