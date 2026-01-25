import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { VERSION_SCALING_CHANNEL_UI_V1 } from "@vertix.gg/bot/src/config/scaling-channel-config";

export class SetupScalingEditButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingEditButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Edit Scaling Settings";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async getEmoji(): Promise<string> {
        return "⚙️";
    }

    protected async isAvailable(): Promise<boolean> {
        const channels = this.uiArgs?.masterChannels || [];
        const scalingChannels = channels.filter( ( channel: any ) => channel?.version === VERSION_SCALING_CHANNEL_UI_V1 );

        return scalingChannels.length === 1;
    }
}
