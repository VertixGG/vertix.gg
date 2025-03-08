import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ClaimStartButton } from "@vertix.gg/bot/src/ui/v2/claim/start/claim-start-button";
import { ClaimStartEmbed } from "@vertix.gg/bot/src/ui/v2/claim/start/claim-start-embed";

export class ClaimStartComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimStartComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected static getElements() {
        return [[ClaimStartButton]];
    }

    protected static getEmbeds() {
        return [ClaimStartEmbed];
    }
}
