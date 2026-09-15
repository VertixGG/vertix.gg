const MENTION_PATTERN = /<@(?:!|&)?([A-Za-z0-9._-]+)>/g;

/**
 * Channel mentions, which discord writes the same way it writes a user's and draws as its own
 * pill. Matched on anything up to the closing bracket rather than on an id's characters: a preview
 * puts the channel's name where the bot would put its id, and a name has spaces and apostrophes in
 * it - `<#Leo's Office>` was left standing as markup in the middle of a sentence.
 */
const CHANNEL_MENTION_PATTERN = /<#([^<>]+)>/g;

export function replaceMentionsWithPills( text: string ): string {
    return text
        .replace( MENTION_PATTERN, "<span class=\"discord-mention-pill\">@$1</span>" )
        .replace( CHANNEL_MENTION_PATTERN, "<span class=\"discord-mention-pill\">#$1</span>" );
}
