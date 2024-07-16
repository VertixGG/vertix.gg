import { uiUtilsDynamicElementsRearrange } from "@vertix.gg/gui/src/ui-utils";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import {
    UI_ELEMENTS_DEFAULT_MAX_PER_ROW,
    UI_ELEMENTS_DEPTH,
    UIInstancesTypes,
} from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    DynamicChannelElementsGroup
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { DynamicChannelEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-embed";

export class DynamicChannelComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannel";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: You should try make it static.
    }

    public static getElementsGroups() {
        return [
            DynamicChannelElementsGroup,
        ];
    }

    protected static getEmbeds() {
        return [
            DynamicChannelEmbed,
        ];
    }

    protected static getDefaultElementsGroup() {
        return "Vertix/UI-V2/DynamicChannelElementsGroup";
    }

    protected async getSchemaInternal() {
        const schema = await super.getSchemaInternal();

        schema.entities.elements = uiUtilsDynamicElementsRearrange( [
            schema.entities.elements.flat( UI_ELEMENTS_DEPTH ).filter( ( element ) =>
                // TODO: There is already mechanism to reduce non-available elements. in `buildComponentsBySchema`.
                // check if required.
                element.isAvailable
            ) as any
        ], UI_ELEMENTS_DEFAULT_MAX_PER_ROW );

        return schema;
    }
}
