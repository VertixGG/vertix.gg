import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { InvalidChannelTypeEmbed } from "@vertix.gg/bot/src/ui/general/invalid-channel-type/invalid-channel-type-embed";

export class InvalidChannelTypeComponent extends UIComponentBase {
    public static getName () {
        return "VertixBot/UI-General/InvalidChannelTypeComponent";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds () {
        return [ InvalidChannelTypeEmbed ];
    }
}
