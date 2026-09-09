import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { YesNoElementsGroup } from "@vertix.gg/bot/src/ui/general/decision/yes-no-elements-group";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import {
    DynamicChannelKnockRequestEmbed
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/request/dynamic-channel-knock-request-embed";

import {
    DynamicChannelKnockAnsweredEmbed
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/knock/request/dynamic-channel-knock-answered-embed";

export class DynamicChannelKnockRequestComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelKnockRequestComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ YesNoElementsGroup ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelKnockRequestEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelKnockAnsweredEmbed ),

            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed )
        ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-General/YesNoElementsGroup";
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V3/DynamicChannelKnockRequestEmbedGroup";
    }
}
