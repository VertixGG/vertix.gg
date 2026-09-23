/**
 * The application the bot is handed out as, and what each place asks Discord for on its behalf.
 *
 * Shared rather than app-local because three surfaces hand the bot out - the site's invite page, the
 * dashboard's "the bot is not in this server" modal, and the bot's own welcome message - and a
 * second copy of an id is how a site ends up inviting one application while selling plans for
 * another. Nothing fails when they drift; somebody just installs the wrong bot.
 */
export const DISCORD_APP_ID = "1538844311062581339";

/**
 * What each invite asks Discord for.
 *
 * `recommended` is the same set as the bot's own invite button, the bot list listings and the app's
 * default install settings in Discord's developer portal, so however someone arrives they are asked
 * for the same thing. It is everything the bot uses and nothing else - `ViewAuditLog` is the one
 * addition over `minimal`, and it is what lets the bot record who invited it.
 *
 * `minimal` drops that, and is otherwise identical.
 *
 * Neither is Administrator, which the site used to recommend. Administrator satisfies every
 * permission check the bot makes, so a server granting it hides any permission the bot asks for but
 * was never given - which is exactly how a set the bot could not actually run on shipped unnoticed
 * and cost a server. Anyone who wants to grant it can still do so from Discord's own role settings
 * after inviting; it is not something to ask a server owner for by default, and bot list reviewers
 * mark it down.
 */
export const DISCORD_INVITE_PERMISSIONS = {
    recommended: "286354576",
    minimal: "286354448"
} as const;

export type TDiscordInvitePermissionsType = keyof typeof DISCORD_INVITE_PERMISSIONS;

/**
 * Function buildBotInviteUrl() :: Where somebody is sent to put the bot in a server.
 *
 * `guildId` is for the callers that already know which server is being talked about - the dashboard
 * asks about one server at a time, and sending somebody to a picker they have already picked from
 * is how an invite ends up in the wrong place. Named, Discord preselects that server and
 * `disable_guild_select` stops the dialog offering the others; it still refuses anyone without
 * Manage Server there, which is the same check the dashboard made before letting them in.
 *
 * The scope stays spelled with `%20` rather than built through `URLSearchParams`, which writes a
 * space as `+`. Both are read the same way by anything that follows the spec, and this is the form
 * every listing and every button has been sending for years.
 */
export function buildBotInviteUrl(
    permissions: TDiscordInvitePermissionsType = "recommended",
    guildId?: string
): string {
    const url = `https://discord.com/oauth2/authorize?client_id=${ DISCORD_APP_ID }` +
        `&permissions=${ DISCORD_INVITE_PERMISSIONS[ permissions ] }&scope=bot%20applications.commands`;

    if ( ! guildId ) {
        return url;
    }

    return `${ url }&guild_id=${ encodeURIComponent( guildId ) }&disable_guild_select=true`;
}
