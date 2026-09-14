import { useEffect, useState } from "react";

import { BUTTON_ROW_LIMITS, joinTemplate, splitTemplate, toRows } from "@vertix.gg/utils/src/button-rows";
import { isV2Version, toV2ButtonIds, toV3ButtonIds } from "@vertix.gg/definitions/src/button-ids";

import { apiClient } from "@vertix.gg/dashboard/src/lib/api-client";
import { useSelectedGuildId } from "@vertix.gg/dashboard/src/hooks/use-selected-guild";
import { useEditorGenerator } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-generator";
import { useButtonCatalogue } from "@vertix.gg/dashboard/src/features/generators/components/buttons-picker";
import { useButtonArrangementStore } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-button-arrangement-store";

import type { DynamicSettings } from "@vertix.gg/dashboard/src/features/generators/types";

/** `move()` target meaning "out of the rows entirely" - the buttons this generator does not carry. */
export const OMITTED_ROW = -1;

/** Marks a drag as ours, so a stray drop from elsewhere on the page is ignored. */
export const ELEMENT_DRAG_MIME = "application/x-vertix-element";

/** The settings a save writes - one of the two, never both, since a scope is one or the other. */
interface ButtonsUpdateBody {
    dynamicChannelButtonsTemplate?: string[];
    dynamicChannelButtonsTemplateByRole?: Record<string, string[]>;
}

/** One element as the flow schema describes it - only the parts the arrangement cares about. */
export interface SchemaElement {
    name: string;
    definition?: {
        emoji?: string;
        elementType?: string;
    };
}

/** `<emoji name='ChannelRename'>`, the token as the buttons menu stores it. */
const EMOJI_TOKEN = /<emoji name='([^']+)'>/;

/** `<:ChannelRename:154...>`, the same artwork once resolved against discord. */
const EMOJI_MARKDOWN = /<a?:([^:]+):\d+>/;

/**
 * Function emojiBaseName() :: The artwork's own name, whichever form it arrives in.
 *
 * The two sides of the join spell the same emoji differently - the buttons menu keeps the token it
 * was authored with, while a component's element comes back resolved against discord - so matching
 * the strings finds nothing. The name inside them is the same in both, and is what actually
 * identifies the artwork.
 */
function emojiBaseName( emoji: string | null | undefined ): string | null {
    if ( ! emoji ) {
        return null;
    }

    return EMOJI_TOKEN.exec( emoji )?.[ 1 ] ?? EMOJI_MARKDOWN.exec( emoji )?.[ 1 ] ?? null;
}

/**
 * Function buttonIdOf() :: The catalogue id an element draws as.
 *
 * The api pairs the two directly when it can - it holds the export with both halves - and the
 * artwork's name stands in when it cannot, which is what an older api returns. An element that
 * matches neither is simply not one of the buttons a generator can carry.
 */
function buttonIdOf(
    element: SchemaElement,
    idByElement: Map<string, string>,
    idByEmojiName: Map<string, string>
): string | undefined {
    const paired = idByElement.get( element.name );

    if ( paired ) {
        return paired;
    }

    const name = emojiBaseName( element.definition?.emoji );

    return name ? idByEmojiName.get( name ) : undefined;
}

/**
 * Function scopedTemplate() :: The stored set a scope reads.
 *
 * The one place that choice is made, so the panel arranging a set and the canvas previewing it
 * cannot end up showing two different scopes' buttons on the same screen.
 *
 * A role with no set of its own reads the default, because the default is what its members are
 * actually getting - a role set replaces the default rather than adding to it, so what an admin
 * starts from when narrowing one is the default itself. An empty entry is a removed set rather
 * than a set of no buttons, and reads the same way; that is the rule the bot resolves by, and a
 * screen that disagreed with it would be describing channels that do not exist.
 */
export function scopedTemplate( settings: DynamicSettings | null | undefined, roleId: string | null ): string[] {
    const template = settings?.dynamicChannelButtonsTemplate ?? [];

    if ( ! roleId ) {
        return template;
    }

    const override = settings?.dynamicChannelButtonsTemplateByRole?.[ roleId ];

    return override?.length ? override : template;
}

/**
 * Function arrangeElementRows() :: A component's elements, in one generator's rows.
 *
 * The one place the arrangement is worked out, so the panel that edits it and the preview that
 * draws it cannot disagree - which is the whole point of arranging it against a generator.
 * Returns null when there is nothing to arrange by, and the caller keeps the schema's own rows.
 */
export function arrangeElementRows( args: {
    schemaRows: SchemaElement[][];
    catalogue: ReadonlyArray<{ value: string; emoji: string | null; element?: string | null }>;
    template: ReadonlyArray<string>;
    rowBreaks: ReadonlyArray<number>;
    draftNames: string[][] | null;
} ): SchemaElement[][] | null {
    const { schemaRows, catalogue, template, rowBreaks, draftNames } = args;

    if ( ! catalogue.length || ! template.length ) {
        return null;
    }

    const idByElement = new Map(
        catalogue
            .filter( ( entry ) => entry.element )
            .map( ( entry ) => [ entry.element as string, entry.value ] )
    );

    const idByEmojiName = new Map(
        catalogue
            .map( ( entry ) => [ emojiBaseName( entry.emoji ), entry.value ] as const )
            .filter( ( pair ): pair is readonly [ string, string ] => null !== pair[ 0 ] )
    );

    const allElements = schemaRows.flat();

    if ( draftNames ) {
        const byName = new Map( allElements.map( ( element ) => [ element.name, element ] ) );

        return withoutEmpty( draftNames.map( ( row ) =>
            row.map( ( name ) => byName.get( name ) ).filter( Boolean ) as SchemaElement[] ) );
    }

    const elementById = new Map<string, SchemaElement>();

    allElements.forEach( ( element ) => {
        const id = buttonIdOf( element, idByElement, idByEmojiName );

        if ( id ) {
            elementById.set( id, element );
        }
    } );

    const arranged = withoutEmpty(
        toRows( template, rowBreaks, BUTTON_ROW_LIMITS.MAX_PER_ROW, BUTTON_ROW_LIMITS.MAX_ROWS )
            .map( ( row ) => row.map( ( id ) => elementById.get( id ) ).filter( Boolean ) as SchemaElement[] )
    );

    // An arrangement that resolves to nothing is not an arrangement - the generator's ids and the
    // component's elements failed to line up - so the schema's own rows are kept instead.
    return arranged.length ? arranged : null;
}

/**
 * Function buttonIdsOf() :: The catalogue ids a set of arranged rows carries, in order.
 *
 * What the legend image is asked for - it takes the buttons as a list, so the picture above a
 * channel's controls names the buttons that channel actually has.
 */
export function buttonIdsOf(
    rows: SchemaElement[][],
    catalogue: ReadonlyArray<{ value: string; emoji: string | null; element?: string | null }>
): string[] {
    const idByElement = new Map(
        catalogue
            .filter( ( entry ) => entry.element )
            .map( ( entry ) => [ entry.element as string, entry.value ] )
    );

    const idByEmojiName = new Map(
        catalogue
            .map( ( entry ) => [ emojiBaseName( entry.emoji ), entry.value ] as const )
            .filter( ( pair ): pair is readonly [ string, string ] => null !== pair[ 0 ] )
    );

    return rows
        .flat()
        .map( ( element ) => buttonIdOf( element, idByElement, idByEmojiName ) )
        .filter( ( id ): id is string => undefined !== id );
}

/** Dragging the last element out of a row leaves one behind, and discord draws no empty rows. */
function withoutEmpty<T>( rows: T[][] ): T[][] {
    return rows.filter( ( row ) => row.length );
}

function locate( rows: SchemaElement[][], name: string ): { row: number; at: number } | null {
    for ( let row = 0; row < rows.length; row++ ) {
        const at = rows[ row ].findIndex( ( element ) => element.name === name );

        if ( 0 <= at ) {
            return { row, at };
        }
    }

    return null;
}

/**
 * Function useArrangedElementRows() :: The component's elements, in this generator's rows.
 *
 * Without a generator there is nothing to arrange against - a row layout only means something
 * applied to a known set - so the schema's own rows are handed back untouched and the section reads
 * as it always did. With one, the rows become that generator's, and the elements it does not carry
 * are set aside rather than drawn among the ones it does.
 *
 * Which of that generator's sets is being arranged comes from the scope: the default one, or a
 * role's. A role's set stands in place of the default for the owners who hold it rather than
 * adding to it, so it is the same gesture applied to a different set - not a second kind of edit.
 */
export function useArrangedElementRows( elementRows: SchemaElement[][] | null | undefined ) {
    const { selected: generator, refresh } = useEditorGenerator();

    // This generator's own version, so the sidebar reads the same catalogue the preview does. Asked
    // without one it answers for v3, and a v2 component's elements matched nothing in it - leaving
    // the section listing the schema's rows while the preview drew the generator's.
    const { catalogue } = useButtonCatalogue( generator?.version );
    const guildId = useSelectedGuildId();

    const draftNames = useButtonArrangementStore( ( state ) => state.draft );
    const setDraftNames = useButtonArrangementStore( ( state ) => state.setDraft );
    const roleId = useButtonArrangementStore( ( state ) => state.roleId );
    const setRoleId = useButtonArrangementStore( ( state ) => state.setRoleId );

    const [ isSaving, setIsSaving ] = useState( false );
    const [ error, setError ] = useState<string | null>( null );

    // A role's set belongs to the generator it was chosen under, so the scope goes back to the
    // default whenever the generator does change. Without this, switching generators - from the
    // picker above the canvas, or by going back to a link naming another one - would leave the
    // panel arranging a role's buttons on a generator nobody chose that role for, and a save
    // would write them there.
    useEffect( () => {
        setRoleId( null );
    }, [ generator?.id, setRoleId ] );

    const schemaRows = elementRows ?? [];

    const settings = generator?.settings;

    const byRole = settings?.dynamicChannelButtonsTemplateByRole ?? {};

    // The stored list carries its own row divisions, so there is one thing to read and one to
    // write - and no second field that can fail to come back.
    const { ids: storedIds, rowBreaks: storedBreaks } =
        splitTemplate( scopedTemplate( settings, roleId ) );

    // Both catalogues are keyed by the v3 slug, so a v2 generator's stored numbers are read into
    // that vocabulary before anything is matched against it.
    const template = toV3ButtonIds( storedIds );

    const isArranged = Boolean( generator ) && catalogue.length > 0 && template.length > 0;

    if ( ! isArranged ) {
        return {
            isArranged: false as const,
            roleId,
            byRole,
            setRole: setRoleId,
            rows: schemaRows,
            omitted: [] as SchemaElement[],
            hasChanges: false,
            isSaving: false,
            error: null as string | null,
            move: () => undefined,
            save: () => undefined,
            clearRole: () => undefined,
            reset: () => undefined
        };
    }

    const idByElement = new Map(
        catalogue
            .filter( ( entry ) => entry.element )
            .map( ( entry ) => [ entry.element as string, entry.value ] )
    );

    const idByEmojiName = new Map(
        catalogue
            .map( ( entry ) => [ emojiBaseName( entry.emoji ), entry.value ] as const )
            .filter( ( pair ): pair is readonly [ string, string ] => null !== pair[ 0 ] )
    );

    const allElements = schemaRows.flat();

    const elementById = new Map<string, SchemaElement>();

    allElements.forEach( ( element ) => {
        const id = buttonIdOf( element, idByElement, idByEmojiName );

        if ( id ) {
            elementById.set( id, element );
        }
    } );

    // The generator's own rows, drawn as the elements that sit in them. An id the component no
    // longer ships is skipped rather than drawn as a gap.
    const saved = withoutEmpty(
        toRows( template, storedBreaks, BUTTON_ROW_LIMITS.MAX_PER_ROW, BUTTON_ROW_LIMITS.MAX_ROWS )
            .map( ( row ) => row.map( ( id ) => elementById.get( id ) ).filter( Boolean ) as SchemaElement[] )
    );

    // An arrangement that resolves to nothing is not an arrangement - the generator's ids and the
    // component's elements failed to line up - so the schema's own rows are drawn instead. Hiding
    // the section, or drawing it empty, would lose the editor a panel that has always worked.
    if ( ! saved.length ) {
        return {
            isArranged: false as const,
            roleId,
            byRole,
            setRole: setRoleId,
            rows: schemaRows,
            omitted: [] as SchemaElement[],
            hasChanges: false,
            isSaving: false,
            error: null as string | null,
            move: () => undefined,
            save: () => undefined,
            clearRole: () => undefined,
            reset: () => undefined
        };
    }

    const byName = new Map( allElements.map( ( element ) => [ element.name, element ] ) );

    const draft = draftNames
        ? withoutEmpty( draftNames.map( ( row ) =>
            row.map( ( name ) => byName.get( name ) ).filter( Boolean ) as SchemaElement[] ) )
        : null;

    const rows = draft ?? saved;

    const setDraft = ( next: SchemaElement[][] ) =>
        setDraftNames( next.map( ( row ) => row.map( ( element ) => element.name ) ) );

    const placed = new Set( rows.flat().map( ( element ) => element.name ) );
    const omitted = allElements.filter( ( element ) => ! placed.has( element.name ) );

    const hasChanges = JSON.stringify( rows.map( ( r ) => r.map( ( e ) => e.name ) ) )
        !== JSON.stringify( saved.map( ( r ) => r.map( ( e ) => e.name ) ) );

    /**
     * The one gesture does both jobs. Dragging within the rows arranges the set; dragging out of
     * them drops a button from it, and dragging one back in adds it - so choosing the buttons and
     * laying them out is the same act in the same place, rather than two screens that have to agree.
     *
     * `targetRow` of `OMITTED_ROW` is the group of buttons this generator does not carry.
     */
    const move = ( movedName: string, targetRow: number, targetAt: number ) => {
        const from = locate( rows, movedName ),
            next = rows.map( ( row ) => [ ...row ] );

        const moved = from
            ? next[ from.row ].splice( from.at, 1 )[ 0 ]
            : omitted.find( ( element ) => element.name === movedName );

        if ( ! moved ) {
            return;
        }

        // Dropped out of the rows: the generator stops carrying it.
        if ( OMITTED_ROW === targetRow ) {
            setDraft( withoutEmpty( next ) );
            return;
        }

        if ( targetRow >= next.length ) {
            if ( BUTTON_ROW_LIMITS.MAX_ROWS <= next.length ) {
                return;
            }

            next.push( [ moved ] );

            setDraft( withoutEmpty( next ) );
            return;
        }

        // Discord refuses an over-full row rather than wrapping it, so the move is declined.
        if ( from?.row !== targetRow && BUTTON_ROW_LIMITS.MAX_PER_ROW <= next[ targetRow ].length ) {
            return;
        }

        const at = from && from.row === targetRow && from.at < targetAt ? targetAt - 1 : targetAt;

        next[ targetRow ].splice( Math.min( at, next[ targetRow ].length ), 0, moved );

        setDraft( withoutEmpty( next ) );
    };

    /**
     * Function write() :: Send a change to the generator's buttons and redraw from what came back.
     *
     * Shared by saving an arrangement and by removing a role's set, so the two cannot disagree
     * about when the draft is let go: only once the settings have been re-read, since dropping it
     * any earlier falls back to the settings loaded at mount and shows the save undone.
     */
    const write = ( body: ButtonsUpdateBody, failure: string, onSaved?: () => void ) => {
        setIsSaving( true );
        setError( null );

        void apiClient.put( `/management/guild/${ guildId }/dynamic/${ generator!.id }`, body )
            .then( () => refresh() )
            .then( () => {
                setDraftNames( null );
                onSaved?.();
            } )
            .catch( () => setError( failure ) )
            .finally( () => setIsSaving( false ) );
    };

    const save = () => {
        const ids = rows.map( ( row ) =>
            row.map( ( element ) => buttonIdOf( element, idByElement, idByEmojiName ) ).filter( Boolean ) as string[] );

        // An empty set is the bot's word for "every button", so writing one would quietly undo the
        // generator's choice instead of saving an arrangement of it. Refused rather than sent.
        // For a role it reads as no set at all, which is the removal - and that has its own button.
        if ( ! ids.flat().length ) {
            setError( "A generator has to carry at least one button" );
            return;
        }

        // Written in the vocabulary the generator's own version reads: v2 channels match a stored
        // entry by number, so saving one as slugs left it drawing no buttons at all against a bot
        // that only parses numbers - and which bot a guild runs is not knowable from here.
        const stored = isV2Version( generator!.version )
            ? ids.map( ( row ) => toV2ButtonIds( row ) )
            : ids;

        // The set and its breaks travel together: the breaks are indices into the set, so one
        // without the other would describe rows that no longer line up with the buttons.
        const template = joinTemplate( stored );

        // A role's set is sent as the whole map. The api replaces it wholesale rather than merging
        // - being absent from it is how a role's set gets removed - so sending only the role being
        // edited would take every other role's set away with it.
        write(
            roleId
                ? { dynamicChannelButtonsTemplateByRole: { ...byRole, [ roleId ]: template } }
                : { dynamicChannelButtonsTemplate: template },
            "The rows could not be saved"
        );
    };

    /**
     * Function clearRole() :: Hand this role's members back the set everybody else gets.
     *
     * Left out of the map rather than written empty, since the api already turns the one into the
     * other, and the bot reads both as the same thing: a role with nothing stored against it falls
     * through to the default.
     *
     * The scope returns to the default afterwards because the role it was pointed at no longer has
     * a set to look at - staying on it would leave the panel showing the default set while naming
     * a role, which is the one reading that is never true.
     */
    const clearRole = () => {
        if ( ! roleId ) {
            return;
        }

        const next = { ...byRole };

        delete next[ roleId ];

        write(
            { dynamicChannelButtonsTemplateByRole: next },
            "The role's buttons could not be removed",
            () => setRoleId( null )
        );
    };

    return {
        isArranged: true as const,
        roleId,
        byRole,
        setRole: setRoleId,
        rows,
        omitted,
        hasChanges,
        isSaving,
        error,
        move,
        save,
        clearRole,
        reset: () => setDraftNames( null )
    };
}
