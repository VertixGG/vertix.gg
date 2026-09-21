import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import {
    DynamicChannelBitrateSelectMenu
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/region/dynamic-channel-bitrate-select-menu";

import {
    DynamicChannelRegionSelectMenu
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/region/dynamic-channel-region-select-menu";

/**
 * The two menus the older interface's region screen carries.
 *
 * One per row, since discord gives a select menu a row to itself and will not put a second beside
 * it.
 */
export class DynamicChannelRegionElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelRegionElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelRegionSelectMenu ],
            [ DynamicChannelBitrateSelectMenu ]
        ];
    }
}
