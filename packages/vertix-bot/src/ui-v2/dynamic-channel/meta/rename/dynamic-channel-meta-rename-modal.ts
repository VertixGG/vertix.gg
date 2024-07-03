import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelMetaRenameInput } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-input";

export class DynamicChannelMetaRenameModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaRenameModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ DynamicChannelMetaRenameInput ]
        ];
    }

    protected getTitle(): string {
        return "Rename dynamic channel";
    }
}
