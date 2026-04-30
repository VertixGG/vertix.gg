import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { NoActiveDynamicChannelEmbed } from "@vertix.gg/bot/src/ui/general/no-active-dynamic-channel/no-active-dynamic-channel-embed";

export class NoActiveDynamicChannelComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/NoActiveDynamicChannelComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [ NoActiveDynamicChannelEmbed ];
    }
}
