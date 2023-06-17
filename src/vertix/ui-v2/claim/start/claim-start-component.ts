import { ClaimStartButton } from "@vertix/ui-v2/claim/start/claim-start-button";
import { ClaimStartEmbed } from "@vertix/ui-v2/claim/start/claim-start-embed";

import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class ClaimStartComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimStartComponent";
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
