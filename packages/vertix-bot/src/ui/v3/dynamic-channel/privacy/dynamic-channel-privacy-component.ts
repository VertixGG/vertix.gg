import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelPrivacyEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-embed";
import { DynamicChannelPrivacySelectMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-select-menu";

export class DynamicChannelPrivacyComponent extends UIComponentBase {
    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPrivacyComponent";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups () {
        return [ UIEmbedsGroupBase.createSingleGroup( DynamicChannelPrivacyEmbed ) ];
    }

    public static getElementsGroups () {
        return [ UIElementsGroupBase.createSingleGroup( DynamicChannelPrivacySelectMenu ) ];
    }

    public static getDefaultEmbedsGroup () {
        return "Vertix/UI-V3/DynamicChannelPrivacyEmbedGroup";
    }

    public static getDefaultElementsGroup () {
        return "Vertix/UI-V3/DynamicChannelPrivacyMenuGroup";
    }

    public static getDefaultMarkdownsGroup () {
        return null;
    }
}
