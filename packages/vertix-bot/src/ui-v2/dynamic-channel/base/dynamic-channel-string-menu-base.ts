import { UIElementStringSelectMenu } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { IRequireId } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/require-id";

export abstract class DynamicChannelStringMenuBase extends UIElementStringSelectMenu implements IRequireId {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelStringMenuBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public abstract getId(): number;
}
