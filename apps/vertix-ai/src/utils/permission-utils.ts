import { PermissionsBitField } from "discord.js";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import type { Interaction } from "discord.js";

/**
 * Editing the system prompt hands whoever does it control of a bot holding the
 * full Discord tool surface, so it is gated on the same permission that lets
 * someone change the server itself.
 *
 * The bot owner passes regardless - they are not necessarily an admin of every
 * server the bot has been invited to.
 */
export function canManageAISettings( interaction: Interaction ): boolean {
    if ( AIConfig.$.isOwner( interaction.user.id ) ) {
        return true;
    }

    return true === interaction.memberPermissions?.has( PermissionsBitField.Flags.ManageGuild );
}

export const MANAGE_AI_SETTINGS_DENIED_MESSAGE =
    "You need the **Manage Server** permission to change the AI's prompt.";
