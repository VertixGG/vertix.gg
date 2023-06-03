import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import {
    DynamicChannelMetaLimitInput
} from "@vertix/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-input";

export class DynamicChannelMetaLimitModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitModal";
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
