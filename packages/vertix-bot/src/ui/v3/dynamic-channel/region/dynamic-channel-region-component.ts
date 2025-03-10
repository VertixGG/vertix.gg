import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelRegionSelectMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-select-menu";

import { DynamicChannelRegionEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-embed";

export class DynamicChannelRegionComponent extends UIComponentBase {
    public static getName () {
        return "Vertix/UI-V3/DynamicChannelRegionComponent";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups () {
        return [ UIEmbedsGroupBase.createSingleGroup( DynamicChannelRegionEmbed ) ];
    }

    public static getElementsGroups () {
        return [ UIElementsGroupBase.createSingleGroup( DynamicChannelRegionSelectMenu ) ];
    }

    public static getDefaultEmbedsGroup () {
        return "Vertix/UI-V3/DynamicChannelRegionEmbedGroup";
    }

    public static getDefaultElementsGroup () {
        return "Vertix/UI-V3/DynamicChannelRegionSelectMenuGroup";
    }

    public static getDefaultMarkdownsGroup () {
        return null;
    }
}
