import { uiUtilsDynamicElementsRearrange } from "@vertix.gg/gui/src/ui-utils";

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

    protected async buildDynamicEntities( args?: UIArgs ) {
        // Kept here because `getSchemaInternal()` is what decides the row order and is handed no
        // args of its own.
        const template = args?.dynamicChannelButtonsTemplate;

        this.buttonsTemplate = Array.isArray( template ) ? template.map( ( id ) => String( id ) ) : [];

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

        schema.entities.elements = uiUtilsDynamicElementsRearrange(
            [ this.orderByTemplate( available ) as any ],
            DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW
        );

        return schema;
    }
}
