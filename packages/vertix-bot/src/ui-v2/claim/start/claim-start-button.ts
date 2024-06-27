import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import {
    DynamicChannelPremiumClaimChannelButton
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/claim/dynamic-channel-premium-claim-channel-button";

import type { UIButtonStyleTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class ClaimStartButton extends DynamicChannelPremiumClaimChannelButton {
    public static getName() {
        return "VertixBot/UI-V2/ClaimStartButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async isDisabled(): Promise<boolean> {
        return false; // Since it static.
    }

    protected async isAvailable(): Promise<boolean> {
        return true;
    }
}
