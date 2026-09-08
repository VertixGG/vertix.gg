import * as React from "react";

/**
 * The custom-emoji artwork the browser cannot resolve for itself.
 *
 * A Discord custom emoji id is only knowable by the application that owns the emoji, which needs
 * the bot token - so the site and dashboard cannot reach Discord directly. The api resolves the
 * artwork and serves it as `name -> data uri` at `/tools/button-emojis.json`; this module fetches
 * that once and hands it to the emoji renderer. Empty until the fetch lands, so a consumer that
 * renders before then simply shows no icon.
 *
 * The artwork is module state read through plain functions, which React cannot see changing, so
 * the module doubles as a store: `useEmojiManifest()` subscribes a component to it and repaints
 * that component itself when the fetch lands.
 */

const DEFAULT_API_BASE_URL = "https://api.voicechannels.online/api";

const MANIFEST_TIMEOUT_MS = 4000;

let sourceByName: Readonly<Record<string, string>> = {};

let manifestPromise: Promise<void> | null = null;

const listeners = new Set<() => void>();

/**
 * Bumped on every manifest write, so a subscriber has a snapshot that changes when the artwork
 * does. The manifest object itself cannot serve as one - the functions that read it are keyed by
 * emoji name, not by identity.
 */
let version = 0;

export function setEmojiManifest( manifest: Readonly<Record<string, string>> ): void {
    sourceByName = { ...manifest };

    version++;

    listeners.forEach( ( listener ) => listener() );
}

function subscribeToEmojiManifest( listener: () => void ): () => void {
    listeners.add( listener );

    return () => {
        listeners.delete( listener );
    };
}

function getEmojiManifestVersion(): number {
    return version;
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
 * Function useEmojiManifest() :: Subscribes a component to the artwork, and starts the one fetch.
 *
 * Any component that resolves emojis - `getCustomEmojiSrc()`, `replaceEmojisWithIcons()`, or the
 * icon components built on them - calls this once, and rerenders by itself when the manifest
 * lands. The returned version is only a snapshot; there is nothing useful to read from it.
 *
 * Subscribing per component rather than repainting from a root wrapper is what makes a cold load
 * work: a provider hands its children down by reference, React bails out of that subtree, and its
 * repaint never reaches the components that rendered before the fetch resolved.
 */
export function useEmojiManifest( baseUrl?: string ): number {
    React.useEffect( () => {
        void loadEmojiManifest( baseUrl );
    }, [ baseUrl ] );

    return React.useSyncExternalStore(
        subscribeToEmojiManifest,
        getEmojiManifestVersion,
        getEmojiManifestVersion
    );
}

/**
 * Function useCustomEmojiSrc() :: The artwork for one custom emoji, kept current.
 *
 * `getCustomEmojiSrc()` with the subscription that makes it repaint, for the common case of a
 * component that needs a single icon.
 */
export function useCustomEmojiSrc( name: string ): string | undefined {
    useEmojiManifest();

    return getCustomEmojiSrc( name );
}

/**
 * Function EmojiManifestProvider() :: Starts the manifest fetch as early as the app root renders.
 *
 * A head start, not a subscription - consumers repaint through `useEmojiManifest()`, so an app
 * that leaves this out still gets its artwork, just one fetch later.
 */
export function EmojiManifestProvider(
    props: { children: React.ReactNode; baseUrl?: string }
): React.ReactElement {
    React.useEffect( () => {
        void loadEmojiManifest( props.baseUrl );
    }, [ props.baseUrl ] );

    return <>{ props.children }</>;
}
