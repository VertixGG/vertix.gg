import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DYNAMIC_CHANNEL_LFM_LIMITS } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

export class DynamicChannelLfmNoteInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelLfmNoteInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<"short"> {
        return "short";
    }

    public async getLabel(): Promise<string> {
        return "WHO ARE YOU LOOKING FOR";
    }

    protected async getPlaceholder(): Promise<string> {
        return "Need 2 for ranked, mic required";
    }

    protected async isRequired(): Promise<boolean> {
        return false;
    }

    protected async getMinLength(): Promise<number> {
        return DYNAMIC_CHANNEL_LFM_LIMITS.NOTE_MIN_LENGTH;
    }

    protected async getMaxLength(): Promise<number> {
        return DYNAMIC_CHANNEL_LFM_LIMITS.NOTE_MAX_LENGTH;
    }
}
