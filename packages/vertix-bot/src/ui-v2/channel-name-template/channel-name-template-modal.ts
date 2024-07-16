
import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelNameTemplateInput } from "@vertix.gg/bot/src/ui-v2/channel-name-template/channel-name-template-input";

export class ChannelNameTemplateModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/ChannelNameTemplateModal";
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
