import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelNameTemplateInput } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-input";

export class ChannelNameTemplateModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/ChannelNameTemplateModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ ChannelNameTemplateInput ]
        ];
    }

    protected getTitle(): string {
        return "Set dynamic channels name";
    }
}
