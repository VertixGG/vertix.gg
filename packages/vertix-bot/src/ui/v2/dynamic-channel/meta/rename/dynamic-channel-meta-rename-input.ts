import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const MIN_INPUT_LENGTH = 0,
    MAX_INPUT_LENGTH = 50;

export class DynamicChannelMetaRenameInput extends UIElementInputBase {
    public static getName () {
        return "Vertix/UI-V2/DynamicChannelMetaRenameInput";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle (): Promise<"short"> {
        return "short";
    }

    public async getLabel (): Promise<string> {
        return "CHOOSE NAME FOR YOUR CHANNEL";
    }

    protected async getPlaceholder (): Promise<string> {
        return this.uiArgs?.defaultChannelName || "";
    }

    protected async getValue (): Promise<string> {
        return this.uiArgs?.channelName || "";
    }

    protected async getMinLength (): Promise<number> {
        return MIN_INPUT_LENGTH;
    }

    protected async getMaxLength (): Promise<number> {
        return MAX_INPUT_LENGTH;
    }
}
