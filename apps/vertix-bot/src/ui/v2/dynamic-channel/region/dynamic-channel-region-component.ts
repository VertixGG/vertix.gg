import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import {
    DynamicChannelRegionElementsGroup
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/region/dynamic-channel-region-elements-group";

import {
    DynamicChannelRegionEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/region/dynamic-channel-region-embed";

/**
 * What the older interface's region screen draws.
 *
 * The screen is new here, where v3 has had one since it shipped: v2 only ever printed the region as
 * a read-only line on a channel's own message, and `/voice region` answered that the feature was not
 * in this interface. It is reached by that command and by nothing else - there is no button for it
 * on the control panel, in this version or the other.
 */
export class DynamicChannelRegionComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelRegionComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [ UIEmbedsGroupBase.createSingleGroup( DynamicChannelRegionEmbed ) ];
    }

    public static getElementsGroups() {
        return [ DynamicChannelRegionElementsGroup ];
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V2/DynamicChannelRegionEmbedGroup";
    }

    public static getDefaultElementsGroup() {
        return DynamicChannelRegionElementsGroup.getName();
    }

    public static getDefaultMarkdownsGroup() {
        return null;
    }
}
