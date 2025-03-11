import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

class DynamicChannelPrimaryMessageEditModalTitle extends UIElementInputBase {
    private configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    );

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditModalTitle";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "Title";
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.title || this.configV3.data.constants.dynamicChannelPrimaryMessageTitle;
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 256;
    }
}

export class DynamicChannelPrimaryMessageEditTitleModal extends UIModalBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditTitleModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "Edit title";
    }

    public static getInputElements() {
        return [ DynamicChannelPrimaryMessageEditModalTitle ];
    }
}
