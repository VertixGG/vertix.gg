import { ChannelNameTemplateInput } from "@vertix.gg/bot/src/ui-v2/channel-name-template/channel-name-template-input";

import { UIModalBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

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
