import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingPrefixInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingPrefixInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel() {
        return "Channel Name Prefix";
    }

    protected async getPlaceholder() {
        return "Voice";
    }

    protected override async getValue() {
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

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel() {
        return "Max Members Per Channel";
    }

    protected async getPlaceholder() {
        return "10";
    }

    protected override async getValue() {
        return "10";
    }

    protected async getMinLength() {
        return 1;
    }

    protected async getMaxLength() {
        return 3;
    }
}

export class SetupScalingConfigModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingConfigModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ SetupScalingPrefixInput ],
            [ SetupScalingMaxMembersInput ]
        ];
    }

    protected getTitle() {
        return "📈 Configure Scaling Channel";
    }
}
