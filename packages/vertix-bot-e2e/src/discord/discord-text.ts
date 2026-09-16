const PICTOGRAPHIC = /[\p{Extended_Pictographic}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}]/gu;

const INVISIBLE = /[\u{200B}-\u{200F}\u{2060}\u{FEFF}]/gu;

const WHITESPACE = /\s+/g;

const TEMPLATE_VARIABLE = /\{[a-zA-Z0-9_]+\}/g;

const REGEXP_SPECIAL = /[.*+?^${}()|[\]\\]/g;

/**
 * An emoji in a language file is a character; in the rendered message it is an `<img>`, so the text
 * discord hands back has a hole where the language file has a symbol. Both sides go through this
 * before they are compared.
 */
export function normalizeDiscordText( value: string ): string {
    return value
        .replace( PICTOGRAPHIC, " " )
        .replace( INVISIBLE, "" )
        .replace( WHITESPACE, " " )
        .trim();
}

export function normalizedIncludes( haystack: string, needle: string ): boolean {
    return normalizeDiscordText( haystack ).includes( normalizeDiscordText( needle ) );
}

/**
 * A stored description carries `{masterChannelId}`-shaped holes that only the running bot can fill,
 * so an assertion matches the sentences around them rather than the whole string.
 */
export function templateToPattern( template: string ): RegExp {
    const source = normalizeDiscordText( template )
        .split( TEMPLATE_VARIABLE )
        .map( ( literal ) => normalizeDiscordText( literal ).replace( REGEXP_SPECIAL, "\\$&" ) )
        .filter( ( literal ) => literal.length )
        .join( "[\\s\\S]*" );

    return new RegExp( source );
}

/**
 * Half the titles in the language files are a template variable followed by a sentence - the emoji is
 * resolved by the running bot and cannot be known here. So a title carrying a variable is matched on
 * the words around it, and a plain one is matched exactly.
 */
export function matchesCopy( actual: string, expected: string ): boolean {
    const normalizedExpected = normalizeDiscordText( expected );

    if ( ! normalizedExpected ) {
        return true;
    }

    if ( expected.includes( "{" ) ) {
        return templateToPattern( expected ).test( normalizeDiscordText( actual ) );
    }

    return normalizeDiscordText( actual ) === normalizedExpected;
}

export function firstSentence( value: string ): string {
    const normalized = normalizeDiscordText( value );

    const [ sentence ] = normalized.split( /(?<=[.!?])\s/ );

    return sentence ?? normalized;
}
