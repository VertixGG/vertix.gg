import { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IRequireId } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/require-id";

export abstract class DynamicChannelUserMenuBase extends UIElementUserSelectMenu implements IRequireId {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelUserMenuBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public abstract getId(): string;

    protected async getMinValues() {
        return 0;
    }
}
