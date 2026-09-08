import * as React from "react";

/**
 * The custom-emoji artwork the browser cannot resolve for itself.
 *
 * A Discord custom emoji id is only knowable by the application that owns the emoji, which needs
 * the bot token - so the site and dashboard cannot reach Discord directly. The api resolves the
 * artwork and serves it as `name -> data uri` at `/tools/button-emojis.json`; this module fetches
 * that once and hands it to the emoji renderer. Empty until the fetch lands, so a consumer that
 * renders before then simply shows no icon and repaints when the manifest arrives.
 */

const DEFAULT_API_BASE_URL = "https://api.voicechannels.online/api";

const MANIFEST_TIMEOUT_MS = 4000;

let sourceByName: Readonly<Record<string, string>> = {};

let manifestPromise: Promise<void> | null = null;

export function setEmojiManifest( manifest: Readonly<Record<string, string>> ): void {
    sourceByName = { ...manifest };
}

/**
 * Function getCustomEmojiSrc() :: The artwork for one custom emoji, by name.
 *
 * Matched the way the bot's own `EmojiManager` matches - a stored name that contains the asked-for
 * one counts - so a caller that asks for `Templates` still finds the `ChannelTemplates` emoji, and
 * an exact hit is always preferred over a looser contains match.
 */
export function getCustomEmojiSrc( name: string ): string | undefined {
    if ( ! name ) {
        return undefined;
    }

    if ( sourceByName[ name ] ) {
        return sourceByName[ name ];
    }

    for ( const [ storedName, src ] of Object.entries( sourceByName ) ) {
        if ( storedName.includes( name ) ) {
            return src;
        }
    }

    return undefined;
}

function resolveBaseUrl( explicit?: string ): string {
    if ( explicit ) {
        return explicit;
    }

    const env = ( import.meta as unknown as { env?: Record<string, string | undefined> } ).env;

    return env?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

/**
 * Function loadEmojiManifest() :: Fetches the artwork manifest once and remembers it.
 *
 * Fire-and-forget by contract: a failed or slow api must never keep the page from rendering, so it
 * resolves either way and leaves the manifest empty on failure. Bounded by a timeout for the same
 * reason - a hung request cannot be allowed to hold a repaint hostage.
 */
export function loadEmojiManifest( baseUrl?: string ): Promise<void> {
    if ( ! manifestPromise ) {
        manifestPromise = ( async() => {
            const controller = new AbortController();
            const timeout = setTimeout( () => controller.abort(), MANIFEST_TIMEOUT_MS );

            try {
                const response = await fetch(
                    `${ resolveBaseUrl( baseUrl ) }/tools/button-emojis.json`,
                    { signal: controller.signal }
                );

                if ( response.ok ) {
                    setEmojiManifest( await response.json() as Record<string, string> );
                }
            } catch {
                // Leave the manifest empty; custom emojis render as nothing rather than breaking.
            } finally {
                clearTimeout( timeout );
            }
        } )();
    }

    return manifestPromise;
}

/**
 * Function EmojiManifestProvider() :: Loads the manifest once and repaints its subtree when it
 * lands.
 *
 * The emoji renderer is a set of plain string functions, not hooks, so there is no per-emoji place
 * to subscribe. Instead this one wrapper - placed at the app root, above every consumer - flips a
 * state when the manifest resolves, and the single repaint reruns them all with the artwork in
 * hand. Children render immediately, so the fetch never blocks first paint.
 */
export function EmojiManifestProvider(
    props: { children: React.ReactNode; baseUrl?: string }
): React.ReactElement {
    const [ , setLoaded ] = React.useState( false );

    React.useEffect( () => {
        let alive = true;

        void loadEmojiManifest( props.baseUrl ).then( () => {
            if ( alive ) {
                setLoaded( true );
            }
        } );

        return () => {
            alive = false;
        };
    }, [ props.baseUrl ] );

    return <>{ props.children }</>;
}
