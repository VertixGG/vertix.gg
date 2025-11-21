import { uiUtilsDynamicElementsRearrange } from "@vertix.gg/gui/src/ui-utils";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import {
    UI_ELEMENTS_DEFAULT_MAX_PER_ROW,
    UI_ELEMENTS_DEPTH,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";
import { DynamicChannelPrimaryMessageEmbedsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-embeds-group";

export class DynamicChannelComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannel";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: You should try make it static.
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
        return DynamicChannelPrimaryMessageEmbedsGroup.getName();
    }

    protected async getSchemaInternal() {
        const schema = await super.getSchemaInternal();

        schema.entities.elements = uiUtilsDynamicElementsRearrange(
            [
                schema.entities.elements.flat( UI_ELEMENTS_DEPTH ).filter(
                    ( element ) =>
                        // TODO: There is already mechanism to reduce non-available elements. in `buildComponentsBySchema`.
                        // check if required.
                        element.isAvailable
                ) as any
            ],
            UI_ELEMENTS_DEFAULT_MAX_PER_ROW
        );

        return schema;
    }
}
