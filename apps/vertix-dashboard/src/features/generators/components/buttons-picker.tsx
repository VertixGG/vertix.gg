import { useEffect, useState } from "react";

import { useCustomEmojiSrc } from "@vertix.gg/discord-ui";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

/** One button a generator can carry, as `/tools/buttons.json` describes it. */
export interface ButtonCatalogueEntry {
    value: string;
    label: string;
    /** The `<emoji name='X'>` token the interface draws, or null for a button without artwork. */
    emoji: string | null;
}

const EMOJI_NAME = /<emoji name='([^']+)'>/;

let cataloguePromise: Promise<ButtonCatalogueEntry[]> | null = null;

/**
 * Function useButtonCatalogue() :: Every button a generator can carry.
 *
 * Fetched once for the page rather than per panel: the list changes when the bot ships a new
 * button, not while an admin is looking at it. A failure leaves the list empty, which the picker
 * reports rather than presenting as a generator with no buttons.
 */
function useButtonCatalogue(): { catalogue: ButtonCatalogueEntry[]; isFailed: boolean } {
    const [ catalogue, setCatalogue ] = useState<ButtonCatalogueEntry[]>( [] );
    const [ isFailed, setIsFailed ] = useState( false );

    useEffect( () => {
        let isMounted = true;

        if ( ! cataloguePromise ) {
            cataloguePromise = fetch( `${ API_CONFIG.BASE_URL }/tools/buttons.json` )
                .then( ( response ) => response.ok ? response.json() as Promise<ButtonCatalogueEntry[]> : [] );
        }

        void cataloguePromise
            .then( ( entries ) => {
                if ( isMounted ) {
                    setCatalogue( entries );
                    setIsFailed( ! entries.length );
                }
            } )
            .catch( () => {
                cataloguePromise = null;

                if ( isMounted ) {
                    setIsFailed( true );
                }
            } );

        return () => {
            isMounted = false;
        };
    }, [] );

    return { catalogue, isFailed };
}

function ButtonArtwork( { emoji, label }: { emoji: string | null; label: string } ) {
    const name = EMOJI_NAME.exec( emoji ?? "" )?.[ 1 ] ?? "";
    const src = useCustomEmojiSrc( name );

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

export interface ButtonsPickerProps {
    /** The ids the generator carries, in whatever order they were stored. */
    selected: string[];
    disabled: boolean;
    onChange: ( value: string[] ) => void;
}

/**
 * Function ButtonsPicker() :: The buttons a generator's channels carry.
 *
 * The same choice the buttons screen offers inside Discord, which until now was the only place it
 * could be made. Kept in the catalogue's order rather than the order they were ticked, since that
 * is the order the interface draws them and an admin is picking from a panel they can picture.
 */
export function ButtonsPicker( { selected, disabled, onChange }: ButtonsPickerProps ) {
    const { catalogue, isFailed } = useButtonCatalogue();

    if ( isFailed ) {
        return (
            <p className="text-sm text-text-muted mb-0">
                The button list could not be read, so it cannot be edited here. It is still editable
                with <code>/setup</code> in Discord.
            </p>
        );
    }

    if ( ! catalogue.length ) {
        return <p className="text-sm text-text-muted mb-0">Loading buttons…</p>;
    }

    const toggle = ( value: string ) => {
        const next = selected.includes( value )
            ? selected.filter( ( id ) => id !== value )
            : catalogue.filter( ( entry ) => entry.value === value || selected.includes( entry.value ) )
                .map( ( entry ) => entry.value );

        onChange( next );
    };

    return (
        <div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                { catalogue.map( ( entry ) => {
                    const isSelected = selected.includes( entry.value );

                    return (
                        <label
                            key={ entry.value }
                            className={ `flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                                ${ disabled ? "opacity-50" : "cursor-pointer" }
                                ${ isSelected
                            ? "bg-surface-elevated border-border-accent"
                            : "bg-background border-border" }` }
                        >
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={ isSelected }
                                disabled={ disabled }
                                onChange={ () => toggle( entry.value ) }
                            />

                            <ButtonArtwork emoji={ entry.emoji } label={ entry.label } />

                            <span className={ `text-sm ${ isSelected ? "text-text-primary" : "text-text-muted" }` }>
                                { entry.label }
                            </span>
                        </label>
                    );
                } ) }
            </div>

            <p className="text-xs text-text-muted mt-2 mb-0">
                { selected.length } of { catalogue.length } shown to channel owners.
                { ! selected.length && " With none, owners get no interface at all." }
            </p>
        </div>
    );
}

export default ButtonsPicker;
