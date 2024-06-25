import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { NotYourChannelEmbed } from "@vertix.gg/bot/src/ui-v2/_general/not-your-channel/not-your-channel-embed";

export class NotYourChannelComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/NotYourChannelComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [
            NotYourChannelEmbed,
        ];
    }
}
