import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelTemplatesSaveInput } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/save/dynamic-channel-templates-save-input";

export class DynamicChannelTemplatesSaveModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesSaveModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ DynamicChannelTemplatesSaveInput ]
        ];
    }

    protected getTitle(): string {
        return "Save Template";
    }
}

