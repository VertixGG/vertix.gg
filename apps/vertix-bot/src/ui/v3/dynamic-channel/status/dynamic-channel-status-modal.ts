import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelStatusInput } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/status/dynamic-channel-status-input";

export class DynamicChannelStatusModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelStatusModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ DynamicChannelStatusInput ] ];
    }

    protected getTitle(): string {
        return "Set dynamic channel status";
    }
}
