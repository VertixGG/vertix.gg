/**
 * Emoji token syntax, shared by the bot, the UI definition exporter and every consumer of the
 * exports.
 *
 * A custom emoji id belongs to the discord application that owns the emoji, so it must never be
 * persisted into a language file or an export - any other application renders such markdown as
 * plain text. Persisted content carries the stable `<emoji name='EmojiName'>` token instead, and
 * each consumer resolves it against its own emoji source: the bot against the live application
 * emojis, the web against its bundled svg icons.
 */

export const EMOJI_TOKEN_PREFIX = "<emoji";

/**
 * Matches `<emoji name='EmojiName'>`.
 *
 * The `emoji` tag name keeps the token unambiguous against every native discord markdown token
 * (`<#id>`, `<@&id>`, `<:name:id>`, `<t:stamp>`) and against wrapped urls. Parsing accepts either
 * quote style and an optional self closing slash, `createEmojiToken()` always emits the single
 * quoted form.
 */
const EMOJI_TOKEN_REGEX = /<emoji\s+name=['"]([A-Za-z0-9_]+)['"]\s*\/?>/g;

/** Matches native discord custom emoji markdown, `<:EmojiName:id>` or the animated `<a:...>`. */
const EMOJI_MARKDOWN_REGEX = /<a?:([A-Za-z0-9_]+):\d+>/g;

/** Matches a string that is nothing but a single token. */
const EMOJI_TOKEN_ONLY_REGEX = /^<emoji\s+name=['"]([A-Za-z0-9_]+)['"]\s*\/?>$/;

export const createEmojiToken = ( name: string ) => `${ EMOJI_TOKEN_PREFIX } name='${ name }'>`;

export const hasEmojiToken = ( text: string ) => text.includes( EMOJI_TOKEN_PREFIX );

/**
 * Function getEmojiTokenName() :: Returns the emoji name when the whole string is a single token,
 * `null` otherwise.
 */
export const getEmojiTokenName = ( text: string ) => EMOJI_TOKEN_ONLY_REGEX.exec( text )?.[ 1 ] ?? null;

/**
 * Function replaceEmojiTokens() :: Replaces every token with whatever `resolve` returns for its
 * name.
 *
 * A name `resolve` has nothing for leaves its token untouched, so text that merely looks like a
 * token is never destroyed.
 */
export const replaceEmojiTokens = ( text: string, resolve: ( name: string ) => string | undefined ) => {
    if ( ! hasEmojiToken( text ) ) {
        return text;
    }

    return text.replace( EMOJI_TOKEN_REGEX, ( token, name: string ) => resolve( name ) ?? token );
};

/**
 * Function replaceEmojiMarkdownWithTokens() :: Turns resolved markdown back into tokens, dropping
 * the application specific id.
 *
 * Used on the way out of the bot, so that content produced by a live application can be persisted
 * without freezing that application's emoji ids into it.
 */
export const replaceEmojiMarkdownWithTokens = ( text: string ) =>
    text.replace( EMOJI_MARKDOWN_REGEX, ( _markdown, name: string ) => createEmojiToken( name ) );
