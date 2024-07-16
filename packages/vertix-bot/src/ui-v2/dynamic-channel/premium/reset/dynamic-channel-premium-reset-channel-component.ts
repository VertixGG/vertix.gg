
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelPremiumResetChannelButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-button";
import { DynamicChannelPremiumResetChannelEmbed } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui-v2/_general/something-went-wrong-embed";

export class DynamicChannelPremiumResetChannelComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPremiumResetChannelComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ UIElementsGroupBase.createSingleGroup( DynamicChannelPremiumResetChannelButton ) ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPremiumResetChannelEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        ];
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
