import { emojiPreviewService } from "@vertix.gg/utils/src/emoji-preview-service";

export interface EmojiReplacement {
    original: string;
    url: string;
    name: string;
}

const CUSTOM_EMOJI_REGEX = /<(a?):([A-Za-z0-9_]+):(\d+)>/g;

export const replaceInlineEmojis = ( input: string ) => {
    const replacements: EmojiReplacement[] = [];
    let output = input;

    const cache = emojiPreviewService.getCacheSnapshot();
    if ( !cache ) {
        return { text: output, replacements };
    }

    output = output.replace( CUSTOM_EMOJI_REGEX, ( match, animated, name, id ) => {
        const entry = Object.values( cache ).find( emoji => emoji.markdown.includes( id ) );

        if ( entry ) {
            replacements.push( {
                original: match,
                url: entry.url,
                name
            } );

            return `<img src="${ entry.url }" alt=":${ name }:" class="ui-inline-emoji" width="20" height="20" style="vertical-align:middle;display:inline-block;" />`;
        }

        const extension = animated ? "gif" : "webp";
        const url = `https://cdn.discordapp.com/emojis/${ id }.${ extension }?size=96&quality=lossless`;

        replacements.push( {
            original: match,
            url,
            name
        } );

        return `<img src="${ url }" alt=":${ name }:" class="ui-inline-emoji" width="20" height="20" style="vertical-align:middle;display:inline-block;" />`;
    } );

    return { text: output, replacements };
};

