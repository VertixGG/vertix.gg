import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelMetaStatusInput } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/status/dynamic-channel-meta-status-input";

export class DynamicChannelMetaStatusModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaStatusModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ DynamicChannelMetaStatusInput ] ];
    }

    protected getTitle(): string {
        return "Set dynamic channel status";
    }
}
