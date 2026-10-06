import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * The way from the heads-up to the page where the plan is kept.
 *
 * The page rather than its checkout: the dashboard answers for whichever server is selected in it,
 * so a link that opened the checkout would leave an owner of several one press from paying for the
 * wrong one. The page names the server and shows its trial before anything is bought.
 */
export class TrialEndingBillingButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/TrialEndingBillingButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Open billing";
    }

    protected async getURL(): Promise<string> {
        return "https://dashboard.voicechannels.online/billing";
    }
}
