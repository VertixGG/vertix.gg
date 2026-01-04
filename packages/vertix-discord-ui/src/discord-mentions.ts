const MENTION_PATTERN = /<@(?:!|&)?([A-Za-z0-9._-]+)>/g;

export function replaceMentionsWithPills( text: string ): string {
    return text.replace( MENTION_PATTERN, `<span class="discord-mention-pill">@$1</span>` );
}


