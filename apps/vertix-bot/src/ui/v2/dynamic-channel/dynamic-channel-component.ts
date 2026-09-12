import { BUTTON_ROW_LIMITS, toRows } from "@vertix.gg/utils/src/button-rows";

import { isV2ButtonEntry } from "@vertix.gg/utils/src/button-ids";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import {
    UI_ELEMENTS_DEFAULT_MAX_PER_ROW,
    UI_ELEMENTS_DEPTH,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { DynamicChannelEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-embed";

import type { UIArgs, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannel";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: You should try make it static.
    }

    public static getElementsGroups() {
        return [ DynamicChannelElementsGroup ];
    }

    protected static getEmbeds() {
        return [ DynamicChannelEmbed ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-V2/DynamicChannelElementsGroup";
    }

    /** The order this generator's buttons were arranged in, for `getSchemaInternal()` below. */
    private buttonsTemplate: string[] = [];

    /** Where that order is divided into rows, empty when the generator never arranged any. */
    private buttonsRowBreaks: number[] = [];

    protected async buildDynamicEntities( args?: UIArgs ) {
        // Kept here because `getSchemaInternal()` is what decides the rows and is handed no args
        // of its own.
        const template = args?.dynamicChannelButtonsTemplate,
            rowBreaks = args?.dynamicChannelButtonsRowBreaks;

        this.buttonsTemplate = Array.isArray( template ) ? template.map( ( id ) => String( id ) ) : [];
        this.buttonsRowBreaks = Array.isArray( rowBreaks ) ? rowBreaks.map( ( at ) => Number( at ) ) : [];

        return super.buildDynamicEntities( args );
    }

    /**
     * Function positionOf() :: Where in the arranged set this element sits, or past the end.
     *
     * V2 answers to a number and the dashboard describes the same button by slug, so the entry is
     * matched by the one rule both halves of that share. A button the template does not name keeps
     * its place behind the ones it does, so one the bot ships after an admin last arranged their
     * set still appears rather than vanishing.
     */
    private positionOf( element: UIEntitySchemaBase ): number {
        const id = DynamicChannelElementsGroup.getByName( element.name )?.getId();

        if ( undefined === id ) {
            return Number.MAX_SAFE_INTEGER;
        }

        const at = this.buttonsTemplate.findIndex( ( entry ) => isV2ButtonEntry( entry, element.name, id ) );

        return 0 > at ? Number.MAX_SAFE_INTEGER : at;
    }

    /**
     * Function orderByTemplate() :: The buttons in the order this generator arranged them.
     *
     * The elements group is one instance for the whole process, so its order cannot vary per
     * generator - the arrangement has to be applied here, where this channel's args are known.
     * A set written by v2's own buttons screen is already in `getSortId()` order, so ordering one
     * of those by its template changes nothing; only a set the dashboard deliberately arranged
     * moves, which is the whole point.
     */
    private orderByTemplate( elements: UIEntitySchemaBase[] ): UIEntitySchemaBase[] {
        if ( ! this.buttonsTemplate.length ) {
            return elements;
        }

        return [ ...elements ].sort( ( a, b ) => this.positionOf( a ) - this.positionOf( b ) );
    }

    /**
     * Function breaksForElements() :: Where the arranged rows divide the buttons actually drawn.
     *
     * The layout is saved against the generator's whole set, but a channel draws only the buttons
     * it has - a role's set is narrower, and a button can be unavailable to this owner. Counting
     * how many of each saved row survived restates the arrangement in terms of what is drawn: the
     * grouping is kept, the gaps close behind the missing, and a row left holding nothing collapses
     * rather than printing empty.
     */
    private breaksForElements( ordered: UIEntitySchemaBase[] ): number[] {
        if ( ! this.buttonsRowBreaks.length || ! this.buttonsTemplate.length ) {
            return [];
        }

        const carries = ( entry: string ) => ordered.some( ( element ) => {
            const id = DynamicChannelElementsGroup.getByName( element.name )?.getId();

            return undefined !== id && isV2ButtonEntry( entry, element.name, id );
        } );

        const breaks: number[] = [];

        let at = 0;

        toRows( this.buttonsTemplate, this.buttonsRowBreaks, BUTTON_ROW_LIMITS.MAX_PER_ROW )
            .slice( 0, -1 )
            .forEach( ( row ) => {
                at += row.filter( carries ).length;

                breaks.push( at );
            } );

        return breaks;
    }

    protected async getSchemaInternal() {
        const schema = await super.getSchemaInternal();

        if ( !schema.entities ) {
            return schema;
        }

        const available = schema.entities.elements.flat( UI_ELEMENTS_DEPTH ).filter(
            ( element ) =>
                // TODO: There is already mechanism to reduce non-available elements. in `buildComponentsBySchema`.
                // check if required.
                element.isAvailable
        );

        const ordered = this.orderByTemplate( available ),
            breaks = this.breaksForElements( ordered );

        // Rows come from the generator's own arrangement rather than from cutting the list every
        // four, which is what made the placement shown in the editor have no effect on what printed.
        //
        // An arrangement is drawn at the width discord actually allows, because that is the width
        // the editor let the admin build it at - honouring five-wide rows four at a time would
        // re-break exactly the rows it was asked to keep. A generator that never arranged anything
        // keeps the narrower default it has always printed at, so nobody's panel re-flows for a
        // feature they did not use.
        schema.entities.elements = toRows(
            ordered,
            breaks,
            breaks.length ? BUTTON_ROW_LIMITS.MAX_PER_ROW : UI_ELEMENTS_DEFAULT_MAX_PER_ROW
        ) as any;

        return schema;
    }
}
