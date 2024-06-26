import { ClaimStartButton } from "@vertix.gg/bot/src/ui-v2/claim/start/claim-start-button";
import { ClaimStartEmbed } from "@vertix.gg/bot/src/ui-v2/claim/start/claim-start-embed";

import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class ClaimStartComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/ClaimStartComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected static getElements() {
        return [
            [ ClaimStartButton ]
        ];
    }

    protected static getEmbeds() {
        return [
            ClaimStartEmbed,
        ];
    }
}
