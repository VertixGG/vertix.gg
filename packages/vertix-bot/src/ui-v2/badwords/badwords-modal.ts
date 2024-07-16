
import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { BadwordsInput } from "@vertix.gg/bot/src/ui-v2/badwords/badwords-input";

export class BadwordsModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/BadwordsModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Can be static.
    }

    public static getInputElements() {
        return [
            [ BadwordsInput ]
        ];
    }

    protected getTitle(): string {
        return "Set bad words";
    }
}
