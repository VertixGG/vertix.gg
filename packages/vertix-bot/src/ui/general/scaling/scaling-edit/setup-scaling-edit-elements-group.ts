import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { SetupScalingCategorySelectMenu } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-category-select-menu";
import { SetupScalingPrefixButton } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-prefix-button";
import { SetupScalingMaxMembersSelect } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-max-members-select";
import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

export class SetupScalingEditElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingEditElementsGroup";
    }

    public static getItems() {
        return [
            [ SetupScalingCategorySelectMenu ],
            [ SetupScalingMaxMembersSelect ],
            [ SetupScalingPrefixButton, DoneButton ]
        ];
    }
}

export default SetupScalingEditElementsGroup;

