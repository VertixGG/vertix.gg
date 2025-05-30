import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { SetupScalingStep1Embed } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-1/setup-scaling-step-1-embed";

export class SetupScalingStep1Component extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingStep1Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbeds() {
        return [ SetupScalingStep1Embed ];
    }
}
