export interface EmojiPreviewEntry {
    markdown: string;
    url: string;
}

declare global {
    var __VERTIX_EMOJI_PREVIEW_CACHE__: Record<string, EmojiPreviewEntry> | undefined;
}

export const setEmojiPreviewCache = ( cache: Record<string, EmojiPreviewEntry> ) => {
    globalThis.__VERTIX_EMOJI_PREVIEW_CACHE__ = { ...cache };
};

export const getEmojiFromPreviewCache = ( baseName: string ): EmojiPreviewEntry | null => {
    const cache = globalThis.__VERTIX_EMOJI_PREVIEW_CACHE__;

    if ( !cache ) {
        return null;
    }

    for ( const [ name, value ] of Object.entries( cache ) ) {
        if ( name.includes( baseName ) ) {
            return value;
        }
    }

    return null;
};

export {};
