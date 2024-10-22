
import { UIModalBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { BadwordsInput } from "@vertix.gg/bot/src/ui-v2/badwords/badwords-input";

export class BadwordsModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V2/BadwordsModal";
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
