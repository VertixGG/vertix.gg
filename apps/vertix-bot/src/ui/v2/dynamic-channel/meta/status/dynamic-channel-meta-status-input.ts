import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DYNAMIC_CHANNEL_STATUS_LIMITS } from "@vertix.gg/bot/src/definitions/dynamic-channel-status";

export class DynamicChannelMetaStatusInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaStatusInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<"short"> {
        return "short";
    }

    public async getLabel(): Promise<string> {
        return "WHAT IS HAPPENING IN YOUR CHANNEL";
    }

    protected async getPlaceholder(): Promise<string> {
        return this.uiArgs?.defaultChannelStatus || "";
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.channelStatus || "";
    }

    protected async isRequired(): Promise<boolean> {
        return false;
    }

    protected async getMinLength(): Promise<number> {
        return DYNAMIC_CHANNEL_STATUS_LIMITS.CUSTOM_MIN_LENGTH;
    }

    protected async getMaxLength(): Promise<number> {
        return DYNAMIC_CHANNEL_STATUS_LIMITS.CUSTOM_MAX_LENGTH;
    }
}
