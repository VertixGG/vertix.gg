import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { SetupScalingStep3Embed } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-step-3-embed";
import { SetupScalingPrefixModal } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-prefix-modal";
import { SetupScalingPrefixButton } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-prefix-button";
import { SetupScalingMaxMembersSelect } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-max-members-select";

export class SetupScalingStep3Component extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingStep3Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ SetupScalingPrefixButton ],
            [ SetupScalingMaxMembersSelect ]
        ];
    }

    public static getEmbeds() {
        return [ SetupScalingStep3Embed ];
    }

    public static getModals() {
        return [ SetupScalingPrefixModal ];
    }
}
