import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    DynamicChannelLimitInput
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-input";

export class DynamicChannelLimitModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelLimitModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ DynamicChannelLimitInput ]
        ];
    }

    protected getTitle() {
        return "Set user limit";
    }
}
