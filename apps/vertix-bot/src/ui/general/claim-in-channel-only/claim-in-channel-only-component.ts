import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ClaimInChannelOnlyEmbed } from "@vertix.gg/bot/src/ui/general/claim-in-channel-only/claim-in-channel-only-embed";

export class ClaimInChannelOnlyComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/ClaimInChannelOnlyComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [ ClaimInChannelOnlyEmbed ];
    }
}
