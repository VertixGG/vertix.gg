import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelLfmNoteInput } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/lfm/dynamic-channel-lfm-note-input";

export class DynamicChannelLfmNoteModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelLfmNoteModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ DynamicChannelLfmNoteInput ] ];
    }

    protected getTitle(): string {
        return "Looking for members";
    }
}
