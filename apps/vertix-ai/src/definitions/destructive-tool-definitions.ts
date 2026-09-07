/**
 * Tools that change or destroy something, and so cannot run on the model's
 * judgement alone.
 *
 * Kept as an explicit list rather than a name pattern: a pattern that misses
 * one tool fails open, and failing open here means a deleted channel.
 */
export const DESTRUCTIVE_TOOL_NAMES: ReadonlySet<string> = new Set( [
    "purge_channel_messages",
    "discord_delete_message",
    "discord_bulk_delete_messages",
    "discord_delete_channel",
    "discord_delete_role",
    "discord_delete_webhook",
    "discord_delete_invite",
    "discord_kick_member",
    "discord_ban_member",
    "discord_unban_member",
    "discord_timeout_member",
    "discord_edit_channel",
    "discord_edit_message",
    "discord_set_channel_permissions",
    "discord_modify_member",
    "discord_add_member_role",
    "discord_remove_member_role",
    "ui_delete_adapter"
] );

export function isDestructiveTool( name: string ): boolean {
    return DESTRUCTIVE_TOOL_NAMES.has( name );
}
