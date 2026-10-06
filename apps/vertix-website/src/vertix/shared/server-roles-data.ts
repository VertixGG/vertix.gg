/**
 * What the three server role pages hand the bot's screens in place of what the bot would work out.
 *
 * Each role is a name a server would give it, written the way the bot's own embeds write a role -
 * `<@&...>` - which the preview draws as a mention. One word each, because that is all the
 * preview's mention pattern carries: a name with a space in it is left standing as markup.
 */

export const VOICE_ROLE_MENTION = "<@&Voice>";

export const VERIFIED_ROLE_MENTION = "<@&Member>";

export const STAFF_ROLE_MENTIONS = "<@&Moderator>, <@&Helper>";

/**
 * How a generator that has no list of its own shows the server's, on its own screens.
 *
 * Copied from the `*(from the server options)*` the bot appends, so the per-generator previews read
 * the way the screen does on a generator nobody has touched.
 */
export const FROM_SERVER_OPTIONS = "*(from the server options)*";
