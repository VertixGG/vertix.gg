import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IRequireId } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/require-id";

export abstract class DynamicChannelStringMenuBase extends UIElementStringSelectMenu implements IRequireId {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelStringMenuBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public abstract getId(): string;
}
