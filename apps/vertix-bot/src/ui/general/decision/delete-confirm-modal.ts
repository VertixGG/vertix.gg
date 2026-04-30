import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DeleteConfirmInput } from "@vertix.gg/bot/src/ui/general/decision/delete-confirm-input";

export class DeleteConfirmModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/DeleteConfirmModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ DeleteConfirmInput ] ];
    }

    protected getTitle(): string {
        return "Confirm deletion";
    }
}
