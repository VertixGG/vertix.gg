import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import {
    DynamicChannelBitrateSelectMenu
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-bitrate-select-menu";

import {
    DynamicChannelRegionSelectMenu
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-select-menu";

/**
 * The two menus the region screen carries.
 *
 * A group of its own rather than the derived single it used to be, because there are two of them
 * now. One per row, since discord gives a select menu a row to itself and will not put a second
 * beside it.
 *
 * Renaming the group away from the derived `...RegionSelectMenuGroup` costs a guild nothing it has
 * customized: an override is stored against an element's name, never a group's - see
 * `ui-element-base.ts`.
 */
export class DynamicChannelRegionElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelRegionElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelRegionSelectMenu ],
            [ DynamicChannelBitrateSelectMenu ]
        ];
    }
}
