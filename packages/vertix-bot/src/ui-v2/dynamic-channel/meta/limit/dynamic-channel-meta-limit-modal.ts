import { UIModalBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-modal-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import {
    DynamicChannelMetaLimitInput
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-input";

export class DynamicChannelMetaLimitModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaLimitModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ DynamicChannelMetaLimitInput ]
        ];
    }

    protected getTitle() {
        return "Set user limit";
    }
}
