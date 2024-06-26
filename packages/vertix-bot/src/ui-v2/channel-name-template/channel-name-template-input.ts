import { DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE } from "@vertix.gg/base/src/definitions/master-channel-defaults";

import { UIElementInputBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIInputStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class ChannelNameTemplateInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-V2/ChannelNameTemplateInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "SET DEFAULT DYNAMIC CHANNELS NAME";
    }

    protected async getPlaceholder(): Promise<string> {
        return DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE;
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.dynamicChannelNameTemplate || this.content?.placeholder ||  DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE;
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 50;
    }
}
