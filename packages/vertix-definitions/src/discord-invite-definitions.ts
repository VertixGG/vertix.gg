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
 * The places an install can be counted from - the link somebody pressed to add the bot.
 *
 * Stored on `GuildInstall` as they are written here, so each one is a storage contract: renaming one
 * splits its history in two. Written out at each link rather than collected under short keys, so a
 * search for one finds every place that sends it.
 */
export const INSTALL_SOURCES = [
    "site-home",
    "site-header",
    "site-pricing",
    "site-docs",
    "site-post",
    "site-invite",
    "dashboard-bot-missing",
    "github-readme"
] as const;

export type TInstallSource = typeof INSTALL_SOURCES[ number ];

/**
 * Function isInstallSource() :: Whether a string is one of the sources, as sent back to the api.
 *
 * What comes back is whatever the link carried, and a link can be written by anybody - only a name on
 * the list is stored.
 */
export function isInstallSource( value: unknown ): value is TInstallSource {
    return "string" === typeof value && ( INSTALL_SOURCES as readonly string[] ).includes( value );
}

export interface IBotInviteOptions {
    /**
     * For the callers that already know which server is being talked about - the dashboard asks about
     * one server at a time. Named, Discord preselects it and `disable_guild_select` stops the dialog
     * offering the others; it still refuses anyone without Manage Server there.
     */
    guildId?: string;

    /**
     * Count the install by where it came from. Only when `callbackUrl` is set: that is the api's install
     * callback, which discord must have on the application's list of redirects - with none, the link is
     * the plain one it always was, and nothing is counted.
     */
    attribution?: {
        callbackUrl: string;
        source: TInstallSource;
    };
}

/**
 * Function buildBotInviteUrl() :: Where somebody is sent to put the bot in a server.
 *
 * With attribution the link asks discord for a code and a redirect back to the api, carrying the source
 * as `state` - discord hands both back once the bot is added, the api exchanges the code for the
 * server it went into, and the install is written down against the link that brought it.
 *
 * The scope stays spelled with `%20` rather than built through `URLSearchParams`, which writes a
 * space as `+`. Both are read the same way by anything that follows the spec, and this is the form
 * every listing and every button has been sending for years.
 */
export function buildBotInviteUrl(
    permissions: TDiscordInvitePermissionsType = "recommended",
    options: IBotInviteOptions = {}
): string {
    let url = `https://discord.com/oauth2/authorize?client_id=${ DISCORD_APP_ID }` +
        `&permissions=${ DISCORD_INVITE_PERMISSIONS[ permissions ] }&scope=bot%20applications.commands`;

    if ( options.guildId ) {
        url += `&guild_id=${ encodeURIComponent( options.guildId ) }&disable_guild_select=true`;
    }

    if ( options.attribution?.callbackUrl ) {
        url += `&response_type=code&redirect_uri=${ encodeURIComponent( options.attribution.callbackUrl ) }` +
            `&state=${ encodeURIComponent( options.attribution.source ) }`;
    }

    return url;
}
