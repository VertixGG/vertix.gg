import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { NotYourChannelEmbed } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-embed";

export class NotYourChannelComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/NotYourChannelComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [NotYourChannelEmbed];
    }
}
