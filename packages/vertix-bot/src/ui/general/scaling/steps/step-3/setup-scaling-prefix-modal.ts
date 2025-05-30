import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { SetupScalingPrefixInput } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-prefix-input";

export class SetupScalingPrefixModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingPrefixModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ SetupScalingPrefixInput ]
        ];
    }

    protected getTitle(): string {
        return "Set Channel Prefix";
    }
}
