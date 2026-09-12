import { useEffect, useState } from "react";

import { GripVertical } from "lucide-react";

import { useCustomEmojiSrc } from "@vertix.gg/discord-ui";

import { BUTTON_ROW_LIMITS, splitTemplate, toRows } from "@vertix.gg/utils/src/button-rows";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

import type { DragEvent, KeyboardEvent } from "react";

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

/** Marks a drag as ours, so a stray drop from elsewhere on the page is ignored. */
const DRAG_MIME = "application/x-vertix-button";

const MOVE_STEP = {
    BACK: -1,
    FORWARD: 1
} as const;

let cataloguePromise: Promise<ButtonCatalogueEntry[]> | null = null;

/**
 * Function useButtonCatalogue() :: Every button a generator can carry.
 *
 * Fetched once for the page rather than per panel: the list changes when the bot ships a new
 * button, not while an admin is looking at it. A failure leaves the list empty, which the picker
 * reports rather than presenting as a generator with no buttons.
 */
export function useButtonCatalogue(): { catalogue: ButtonCatalogueEntry[]; isFailed: boolean } {
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

export function ButtonArtwork( { emoji, label }: { emoji: string | null; label: string } ) {
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

/**
 * Function moveTo() :: The selection with `movedId` sitting where `targetId` was.
 *
 * A move rather than a swap: an admin dragging a button three places left expects the ones it
 * passes to close up behind it, which is what the interface does when it redraws the row. Removing
 * before inserting is what makes a drag in either direction land where it was dropped.
 */
function moveTo( selected: string[], movedId: string, targetId: string ): string[] {
    const from = selected.indexOf( movedId ),
        to = selected.indexOf( targetId );

    if ( 0 > from || 0 > to || from === to ) {
        return selected;
    }

    const next = [ ...selected ];

    next.splice( from, 1 );
    next.splice( to, 0, movedId );

    return next;
}

/**
 * Function moveBy() :: The selection with `movedId` shifted one place.
 *
 * The keyboard route to the same result as a drag, since a pointer is not the only way an admin
 * arrives here. Out of range is a no-op rather than a wrap: a button at the end that jumps to the
 * front reads as a bug, not as a move.
 */
function moveBy( selected: string[], movedId: string, delta: number ): string[] {
    const from = selected.indexOf( movedId );

    if ( 0 > from ) {
        return selected;
    }

    const to = from + delta;

    if ( 0 > to || to >= selected.length ) {
        return selected;
    }

    const next = [ ...selected ];

    next.splice( from, 1 );
    next.splice( to, 0, movedId );

    return next;
}

/**
 * Function isButtonDrag() :: Whether the drag in flight is one of ours.
 *
 * A dropped file or a drag from elsewhere on the page reaches these handlers too, and reordering
 * on one would move a button the admin never picked up.
 */
function isButtonDrag( event: DragEvent<HTMLElement> ): boolean {
    return event.dataTransfer.types.includes( DRAG_MIME );
}

/**
 * Function ButtonsSummary() :: The buttons a generator carries, to look at rather than edit.
 *
 * Shares the picker's catalogue, which is fetched once for the page, so reading a generator's
 * settings costs nothing extra. Drawn rather than listed as text because the order is part of the
 * setting now, and a row of artwork in order is the thing a channel owner will actually see.
 */
export function ButtonsSummary( { selected }: { selected: string[] } ) {
    const { catalogue, isFailed } = useButtonCatalogue();

    // The stored list carries its own row divisions, so the set and the rows come out together.
    const { ids, rowBreaks } = splitTemplate( selected );

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
    const rows = toRows(
        ids.filter( ( id ) => byValue.has( id ) ),
        rowBreaks,
        BUTTON_ROW_LIMITS.MAX_PER_ROW,
        BUTTON_ROW_LIMITS.MAX_ROWS
    );

    return (
        <span className="flex flex-col gap-1">
            { rows.map( ( row, rowIndex ) => (
                <span key={ rowIndex } className="flex flex-wrap items-center gap-1.5">
                    { row.map( ( id ) => {
                        const entry = byValue.get( id )!;

                        return (
                            <span
                                key={ id }
                                title={ entry.label }
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                                    bg-surface-elevated border border-border text-xs text-text-primary"
                            >
                                <ButtonArtwork emoji={ entry.emoji } label={ entry.label } />
                                { entry.label }
                            </span>
                        );
                    } ) }
                </span>
            ) ) }
        </span>
    );
}

export interface ButtonsPickerProps {
    /** The ids the generator carries, in the order channel owners see them. */
    selected: string[];
    /**
     * Where that order is divided into rows. Carried through rather than edited here - rows are
     * arranged in the interface editor - but kept in step as buttons come and go, so an
     * arrangement made there survives a change of mind about the set.
     */
    rowBreaks: number[];
    disabled: boolean;
    onChange: ( value: string[], rowBreaks: number[] ) => void;
}

/**
 * Function ButtonsPicker() :: The buttons a generator's channels carry, and the order they carry them in.
 *
 * The same choice the buttons screen offers inside Discord, plus the ordering that screen cannot
 * express - a select menu has no way to say "this one first". Order is kept as the admin arranges
 * it rather than normalised to the catalogue, because the same array drives the buttons and the
 * legend drawn above them, and a legend in a different order than its buttons is worse than none.
 */
export function ButtonsPicker( { selected, rowBreaks, disabled, onChange }: ButtonsPickerProps ) {
    const { catalogue, isFailed } = useButtonCatalogue();
    const [ draggedId, setDraggedId ] = useState<string | null>( null );
    const [ dropTargetId, setDropTargetId ] = useState<string | null>( null );

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

    const byValue = new Map( catalogue.map( ( entry ) => [ entry.value, entry ] ) );

    // Driven by `selected` rather than by the catalogue, so the admin's order is what is drawn. An
    // id the catalogue no longer knows is dropped here rather than rendered as a blank tile.
    const chosen = selected
        .map( ( id ) => byValue.get( id ) )
        .filter( ( entry ): entry is ButtonCatalogueEntry => Boolean( entry ) );

    const available = catalogue.filter( ( entry ) => ! selected.includes( entry.value ) );

    // Appended, so it joins the last row; the breaks count what comes before them and are unmoved.
    const add = ( value: string ) => onChange( [ ...selected, value ], rowBreaks );

    const remove = ( value: string ) => {
        const at = selected.indexOf( value );

        // A break counts the buttons before it, so dropping one from earlier in the list slides
        // every break past it back by one - otherwise the rows would silently re-divide.
        onChange(
            selected.filter( ( id ) => id !== value ),
            rowBreaks.map( ( count ) => count > at ? count - 1 : count )
        );
    };

    const handleDrop = ( targetId: string ) => {
        setDropTargetId( null );

        if ( ! draggedId ) {
            return;
        }

        const next = moveTo( selected, draggedId, targetId );

        setDraggedId( null );

        if ( next !== selected ) {
            onChange( next, rowBreaks );
        }
    };

    const handleKeyDown = ( event: KeyboardEvent<HTMLElement>, value: string ) => {
        // Alt so the arrows keep meaning "move the caret" everywhere else on the form.
        if ( ! event.altKey ) {
            return;
        }

        const delta = "ArrowLeft" === event.key
            ? MOVE_STEP.BACK
            : "ArrowRight" === event.key ? MOVE_STEP.FORWARD : null;

        if ( null === delta ) {
            return;
        }

        event.preventDefault();

        const next = moveBy( selected, value, delta );

        if ( next !== selected ) {
            onChange( next, rowBreaks );
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <p className="text-xs text-text-muted mt-0 mb-2">
                    { chosen.length
                        ? "Shown to channel owners, in this order. Drag to rearrange, or hold Alt and press ← →."
                        : "Nothing picked, so channels carry every button. Pick some to choose the set and its order." }
                </p>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    { chosen.map( ( entry, index ) => (
                        <div
                            key={ entry.value }
                            draggable={ ! disabled }
                            onDragStart={ ( event ) => {
                                setDraggedId( entry.value );
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData( DRAG_MIME, entry.value );
                            } }
                            onDragOver={ ( event ) => {
                                if ( ! isButtonDrag( event ) || draggedId === entry.value ) {
                                    return;
                                }

                                event.preventDefault();
                                event.dataTransfer.dropEffect = "move";
                                setDropTargetId( entry.value );
                            } }
                            onDragLeave={ () => setDropTargetId(
                                ( current ) => current === entry.value ? null : current
                            ) }
                            onDrop={ ( event ) => {
                                if ( ! isButtonDrag( event ) ) {
                                    return;
                                }

                                event.preventDefault();
                                handleDrop( entry.value );
                            } }
                            onDragEnd={ () => {
                                setDraggedId( null );
                                setDropTargetId( null );
                            } }
                            className={ `flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                                bg-surface-elevated border-border-accent
                                ${ disabled ? "opacity-50" : "cursor-grab active:cursor-grabbing" }
                                ${ draggedId === entry.value ? "opacity-40" : "" }
                                ${ dropTargetId === entry.value ? "ring-2 ring-border-accent" : "" }` }
                        >
                            <GripVertical
                                aria-hidden="true"
                                className="w-4 h-4 shrink-0 text-text-muted"
                            />

                            <span className="text-xs tabular-nums text-text-muted w-4 shrink-0">
                                { index + 1 }
                            </span>

                            <ButtonArtwork emoji={ entry.emoji } label={ entry.label } />

                            <span className="text-sm text-text-primary truncate">
                                { entry.label }
                            </span>

                            <button
                                type="button"
                                disabled={ disabled }
                                onClick={ () => remove( entry.value ) }
                                onKeyDown={ ( event ) => handleKeyDown( event, entry.value ) }
                                aria-label={ `Remove ${ entry.label }, position ${ index + 1 } of ${ chosen.length }` }
                                className="ml-auto text-xs text-text-muted hover:text-text-primary shrink-0"
                            >
                                Remove
                            </button>
                        </div>
                    ) ) }
                </div>
            </div>

            { available.length > 0 && (
                <div>
                    <p className="text-xs text-text-muted mt-0 mb-2">
                        Not shown - pick one to add it to the end.
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        { available.map( ( entry ) => (
                            <label
                                key={ entry.value }
                                className={ `flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                                    bg-background border-border
                                    ${ disabled ? "opacity-50" : "cursor-pointer" }` }
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={ false }
                                    disabled={ disabled }
                                    onChange={ () => add( entry.value ) }
                                />

                                <ButtonArtwork emoji={ entry.emoji } label={ entry.label } />

                                <span className="text-sm text-text-muted truncate">
                                    { entry.label }
                                </span>
                            </label>
                        ) ) }
                    </div>
                </div>
            ) }

            <p className="text-xs text-text-muted mt-2 mb-0">
                { chosen.length } of { catalogue.length } shown to channel owners.
            </p>
        </div>
    );
}

export default ButtonsPicker;
