import { toRows } from "@vertix.gg/utils/src/button-rows";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import {
    UI_ELEMENTS_DEPTH,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

import { DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";
import { DynamicChannelPrimaryMessageEmbedsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-embeds-group";

import type { UIArgs, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannel";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: You should try make it static.
    }

    public static getMaxElementsPerRow(): number {
        return DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW;
    }

    public static getElementsGroups() {
        return [ DynamicChannelPrimaryMessageElementsGroup ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageElementsGroup";
    }

    public static getEmbedsGroups() {
        return [ DynamicChannelPrimaryMessageEmbedsGroup ];
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V3/DynamicChannel/EmbedsGroup";
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
     * Function orderByTemplate() :: The buttons in the order this generator arranged them.
     *
     * The elements group is one instance for the whole process, so its order cannot vary per
     * generator - the arrangement has to be applied here, where this channel's args are known.
     * A button the template does not name keeps its place behind the ones it does, so one the bot
     * ships after an admin last arranged their set still appears rather than vanishing.
     */
    private orderByTemplate( elements: UIEntitySchemaBase[] ): UIEntitySchemaBase[] {
        if ( ! this.buttonsTemplate.length ) {
            return elements;
        }

        const positionOf = ( element: UIEntitySchemaBase ) => {
            const id = DynamicChannelPrimaryMessageElementsGroup.getByName( element.name )?.getId(),
                at = undefined === id ? -1 : this.buttonsTemplate.indexOf( id );

            return 0 > at ? Number.MAX_SAFE_INTEGER : at;
        };

        return [ ...elements ].sort( ( a, b ) => positionOf( a ) - positionOf( b ) );
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

        const present = new Set(
            ordered
                .map( ( element ) => DynamicChannelPrimaryMessageElementsGroup.getByName( element.name )?.getId() )
                .filter( ( id ): id is string => undefined !== id )
        );

        const breaks: number[] = [];

        let at = 0;

        toRows( this.buttonsTemplate, this.buttonsRowBreaks, DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW )
            .slice( 0, -1 )
            .forEach( ( row ) => {
                at += row.filter( ( id ) => present.has( id ) ).length;

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

        const ordered = this.orderByTemplate( available );

        // Rows come from the generator's own arrangement rather than from cutting the list every
        // five, which is what made the placement shown in the editor have no effect on what printed.
        schema.entities.elements = toRows(
            ordered,
            this.breaksForElements( ordered ),
            DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW
        ) as any;

        return schema;
    }
}
