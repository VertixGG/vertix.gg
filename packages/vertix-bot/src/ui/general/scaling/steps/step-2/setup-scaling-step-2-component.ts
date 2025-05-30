import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { SetupScalingStep2Embed } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-step-2-embed";
import { SetupScalingCategorySelectMenu } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-category-select-menu";
import { SetupScalingCategoryNameModal } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-category-name-modal";

export class SetupScalingStep2Component extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingStep2Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ SetupScalingCategorySelectMenu ]
        ];
    }

    public static getEmbeds() {
        return [ SetupScalingStep2Embed ];
    }

    public static getModals() {
        return [ SetupScalingCategoryNameModal ];
    }
}
