import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { SetupScalingCategoryNameInput } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-category-name-input";

export class SetupScalingCategoryNameModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingCategoryNameModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ SetupScalingCategoryNameInput ] ];
    }

    protected getTitle(): string {
        return "Create Category for Auto-Scaling Channels";
    }
}
