import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { TrialEndingEmbed } from "@vertix.gg/bot/src/ui/general/trial-ending/trial-ending-embed";
import { TrialEndingBillingButton } from "@vertix.gg/bot/src/ui/general/trial-ending/trial-ending-billing-button";

export class TrialEndingComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/TrialEndingComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [ [ TrialEndingBillingButton ] ];
    }

    public static getEmbeds() {
        return [ TrialEndingEmbed ];
    }
}
