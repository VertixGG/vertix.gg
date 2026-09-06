import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelCreateFailedEmbed } from "@vertix.gg/bot/src/ui/general/channel-create-failed/channel-create-failed-embed";

export class ChannelCreateFailedComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/ChannelCreateFailedComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [ ChannelCreateFailedEmbed ];
    }
}
