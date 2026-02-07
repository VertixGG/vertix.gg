import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { VERSION_SCALING_CHANNEL_UI_V1 } from "@vertix.gg/bot/src/config/scaling-channel-config";

import type { UIArgs, UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

const getDefaultScalingPrefix = () => {
    const config = ConfigManager.$.get<ScalingChannelConfigInterface>(
        "Vertix/Config/ScalingChannel",
        VERSION_SCALING_CHANNEL_UI_V1
    ).data;

    return config.constants?.scalingChannelDefaultPrefix || config.settings?.scalingChannelPrefix || "";
};

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
        return getDefaultScalingPrefix();
    }

    protected override async getValue() {
        return this.uiArgs?.scalingPrefix || this.content?.placeholder || getDefaultScalingPrefix();
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
        const value = this.uiArgs?.scalingMaxMembers;

        if ( typeof value === "number" ) {
            return value.toString();
        }

        return this.content?.placeholder || "10";
    }

    protected async getMinLength() {
        return 1;
    }

    protected async getMaxLength() {
        return 3;
    }
}

export class SetupScalingConfigModal extends UIModalBase {
    private buildArgs: UIArgs | undefined;

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

    public async build( args?: UIArgs ) {
        this.buildArgs = args;
        return super.build( args );
    }

    protected getTitle() {
        const index = this.buildArgs?.scalingMasterChannelIndex;

        if ( index === 0 || typeof index === "number" || typeof index === "string" ) {
            const displayIndex = Number( index ) + 1;
            return `📈 Configure Scaling Channel #${ displayIndex }`;
        }

        return "📈 Configure Scaling Channel";
    }
}
