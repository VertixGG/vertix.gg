import { useEffect, useState } from "react";

import { useCustomEmojiSrc } from "@vertix.gg/discord-ui";

import { BUTTON_ROW_LIMITS, splitTemplate, toRows } from "@vertix.gg/utils/src/button-rows";
import { DYNAMIC_CHANNEL_COMPONENT, buttonsPerRow, isV2Version, toV3ButtonIds } from "@vertix.gg/definitions/src/button-ids";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";
import { useGuildCustomization } from "@vertix.gg/dashboard/src/hooks/use-guild-customization";
import { useLanguageStore } from "@vertix.gg/dashboard/src/hooks/use-language-store";
import { resolveCustomization } from "@vertix.gg/dashboard/src/features/flow-editor/lib/customization-index";

/** One button a generator can carry, as `/tools/buttons.json` describes it. */
export interface ButtonCatalogueEntry {
    value: string;
    label: string;
    /** The `<emoji name='X'>` token the interface draws, or null for a button without artwork. */
    emoji: string | null;
    /** Which element of the dynamic channel component draws it, resolved by the api. */
    element?: string | null;
}

const EMOJI_NAME = /<emoji name='([^']+)'>/;

// One promise per interface version. The two describe the same buttons with different artwork, and
// a guild can hold generators of both, so caching a single list would show whichever was asked for
// first to all of them.
const cataloguePromises = new Map<string, Promise<ButtonCatalogueEntry[]>>();

/**
 * Function useButtonCatalogue() :: Every button a generator of this version can carry.
 *
 * Fetched once per version rather than per panel: the list changes when the bot ships a new button,
 * not while an admin is looking at it. A failure leaves the list empty, which the picker reports
 * rather than presenting as a generator with no buttons.
 */
export function useButtonCatalogue( version?: string | null ): { catalogue: ButtonCatalogueEntry[]; isFailed: boolean } {
    const [ catalogue, setCatalogue ] = useState<ButtonCatalogueEntry[]>( [] );
    const [ isFailed, setIsFailed ] = useState( false );

    useEffect( () => {
        let isMounted = true;

        const key = version ?? "";

        let promise = cataloguePromises.get( key );

        if ( ! promise ) {
            const query = version ? `?version=${ encodeURIComponent( version ) }` : "";

            promise = fetch( `${ API_CONFIG.BASE_URL }/tools/buttons.json${ query }` )
                .then( ( response ) => response.ok ? response.json() as Promise<ButtonCatalogueEntry[]> : [] );

            cataloguePromises.set( key, promise );
        }

        void promise
            .then( ( entries ) => {
                if ( isMounted ) {
                    setCatalogue( entries );
                    setIsFailed( ! entries.length );
                }
            } )
            .catch( () => {
                cataloguePromises.delete( key );

                if ( isMounted ) {
                    setIsFailed( true );
                }
            } );

        return () => {
            isMounted = false;
        };
    }, [ version ] );

    return { catalogue, isFailed };
}

export function ButtonArtwork( { emoji, label }: { emoji: string | null; label: string } ) {
    const name = EMOJI_NAME.exec( emoji ?? "" )?.[ 1 ] ?? "";
    const src = useCustomEmojiSrc( name );

    // V2 draws its buttons with plain unicode emoji rather than application emoji, and those need
    // no manifest - there is nothing to resolve, the character is the artwork. Without this they
    // fell through to the blank square below, so a v2 generator listed its buttons unlabelled.
    if ( ! src && ! name && emoji ) {
        return (
            <span aria-label={ label } role="img" className="w-5 h-5 shrink-0 leading-5 text-center">
                { emoji }
            </span>
        );
    }

    if ( ! src ) {
        return <span aria-hidden="true" className="w-5 h-5 shrink-0 rounded bg-surface-elevated" />;
    }

    return (
        <img
            src={ src }
            alt={ label }
            draggable={ false }
            className="w-5 h-5 shrink-0"
        />
    );
}

/**
 * Function ButtonsSummary() :: The buttons a generator carries, to look at rather than edit.
 *
 * Shares the picker's catalogue, which is fetched once for the page, so reading a generator's
 * settings costs nothing extra. Drawn rather than listed as text because the order is part of the
 * setting now, and a row of artwork in order is the thing a channel owner will actually see.
 *
 * Named as this generator names them: an override written about it wins, the server's is what it
 * falls back to, and the name the component shipped with is under both. The catalogue alone is
 * none of those - it is the bot's own wording, which is the one thing no channel here prints once
 * an admin has changed it. A row that says "shown to users" has to mean it.
 */
export function ButtonsSummary( {
    selected,
    version,
    masterChannelId
}: {
    selected: string[];
    version?: string | null;
    /** The generator these buttons belong to, so its own wording is preferred over the server's. */
    masterChannelId?: string | null;
} ) {
    const { catalogue, isFailed } = useButtonCatalogue( version );
    const customization = useGuildCustomization();
    const language = useLanguageStore( ( state ) => state.selectedLanguage );

    // The same resolver the editor and the bot use, so the three cannot disagree about which
    // layer wins.
    const resolved = resolveCustomization( customization, {
        component: isV2Version( version ) ? DYNAMIC_CHANNEL_COMPONENT.V2 : DYNAMIC_CHANNEL_COMPONENT.V3,
        state: null,
        language,
        masterChannelId: masterChannelId ?? null
    } );

    const elementOverrides = resolved?.elementOverrides ?? {};

    // The stored list carries its own row divisions, so the set and the rows come out together.
    const { ids: storedIds, rowBreaks } = splitTemplate( selected );

    // A v2 generator stores its set as numbers against its own elements group, and the catalogue
    // here is v3's. Read straight, every one of those numbers failed to match and the panel showed
    // whichever slugs happened to be in the row beside them - a set the admin never chose. The
    // catalogue is shared because the buttons are the same buttons; only the ids differ.
    const ids = toV3ButtonIds( storedIds );

    // An empty template is not an empty interface: the bot falls back to every button, both in
    // `master-channel-config-v3` and when it resolves a channel's args.
    if ( ! ids.length ) {
        return <span className="text-text-primary">Every button</span>;
    }

    if ( isFailed || ! catalogue.length ) {
        // The count is still worth showing when the labels cannot be read.
        return <span className="text-text-primary">{ ids.length } selected</span>;
    }

    const byValue = new Map( catalogue.map( ( entry ) => [ entry.value, entry ] ) );

    // In the rows the interface draws them in, so reading the settings shows the arrangement
    // rather than a sequence that has to be imagined back into rows.
    // Cut where this version cuts. Five is what discord allows and what v3 uses, but v2 draws four
    // - so a v2 generator's settings showed rows of five beside channels drawing rows of four.
    const rows = toRows(
        ids.filter( ( id ) => byValue.has( id ) ),
        rowBreaks,
        buttonsPerRow( version ),
        BUTTON_ROW_LIMITS.MAX_ROWS
    );

    return (
        <span className="flex flex-col gap-1">
            { rows.map( ( row, rowIndex ) => (
                <span key={ rowIndex } className="flex flex-wrap items-center gap-1.5">
                    { row.map( ( id ) => {
                        const entry = byValue.get( id )!;

                        // The override is stored against the element that draws the button, which
                        // is what the catalogue carries alongside the id - so the two join here
                        // without either side having to know the other's vocabulary.
                        const override = entry.element ? elementOverrides[ entry.element ] : undefined;

                        const label = override?.label ?? entry.label;
                        const emoji = override?.emoji ?? entry.emoji;

                        return (
                            <span
                                key={ id }
                                title={ label }
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                                    bg-surface-elevated border border-border text-xs text-text-primary"
                            >
                                <ButtonArtwork emoji={ emoji } label={ label } />
                                { label }
                            </span>
                        );
                    } ) }
                </span>
            ) ) }
        </span>
    );
}
