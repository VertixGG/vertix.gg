import { UIElementUserSelectMenu } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-user-select-menu";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { IRequireId } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/require-id";

export abstract class DynamicChannelUserMenuBase extends UIElementUserSelectMenu implements IRequireId {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelUserMenuBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public abstract getId(): number;

    protected async getMinValues() {
        return 0;
    }
}
