import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelRenameInput } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-input";

export class DynamicChannelRenameModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRenameModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ DynamicChannelRenameInput ] ];
    }

    protected getTitle(): string {
        return "Rename dynamic channel";
    }
}
