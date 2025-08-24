import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SetupScalingEditElementsGroup } from "./setup-scaling-edit-elements-group";
import { SetupScalingEditEmbed } from "./setup-scaling-edit-embed";

import { SetupScalingCategoryNameModal } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-category-name-modal";
import { SetupScalingPrefixModal } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-prefix-modal";

export class SetupScalingEditComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingEditComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getElementsGroups() {
        return [ SetupScalingEditElementsGroup ];
    }

    public static getEmbedsGroups() {
        return [ UIEmbedsGroupBase.createSingleGroup( SetupScalingEditEmbed ) ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-General/SetupScalingEditElementsGroup";
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-General/SetupScalingEditEmbedGroup";
    }

    public static getModals() {
        return [ SetupScalingCategoryNameModal, SetupScalingPrefixModal ];
    }
}

export default SetupScalingEditComponent;

