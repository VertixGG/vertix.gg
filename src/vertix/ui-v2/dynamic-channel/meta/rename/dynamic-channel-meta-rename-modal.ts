import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { DynamicChannelMetaRenameInput } from "@vertix/ui-v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-input";

export class DynamicChannelMetaRenameModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameModal";
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
