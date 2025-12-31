import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIElementModalBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingPrefixInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingPrefixInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Channel Name Prefix";
    }

    protected async getPlaceholder() {
        return "Voice";
    }

    protected async getDefaultValue() {
        return "Voice";
    }

    protected async getMinLength() {
        return 1;
    }

    protected async getMaxLength() {
        return 50;
    }
}

export class SetupScalingMaxMembersInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingMaxMembersInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Max Members Per Channel";
    }

    protected async getPlaceholder() {
        return "10";
    }

    protected async getDefaultValue() {
        return "10";
    }

    protected async getMinLength() {
        return 1;
    }

    protected async getMaxLength() {
        return 3;
    }
}

export class SetupScalingConfigModal extends UIElementModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingConfigModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getTitle() {
        return "📈 Configure Scaling Channel";
    }

    protected async getInputElements() {
        return [
            [ SetupScalingPrefixInput ],
            [ SetupScalingMaxMembersInput ]
        ];
    }
}


