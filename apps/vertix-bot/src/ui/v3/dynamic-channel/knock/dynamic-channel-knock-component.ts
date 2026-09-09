import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import { DynamicChannelKnockEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-embed";
import { DynamicChannelKnockSentEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-sent-embed";
import { DynamicChannelKnockNoneEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-none-embed";
import { DynamicChannelKnockWaitingEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-waiting-embed";
import { DynamicChannelKnockChannelMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/dynamic-channel-knock-channel-menu";

export class DynamicChannelKnockComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelKnockComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ UIElementsGroupBase.createSingleGroup( DynamicChannelKnockChannelMenu ) ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelKnockEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelKnockSentEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelKnockNoneEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelKnockWaitingEmbed ),

            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed )
        ];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
