import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

class DynamicChannelPrimaryMessageEditModalDescription extends UIElementInputBase {
    private configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    );

    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalDescription";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "Description";
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.description || this.configV3.data.constants.dynamicChannelPrimaryMessageDescription;
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 4000;
    }
}

export class DynamicChannelPrimaryMessageEditDescriptionModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "Edit Description";
    }

    public static getInputElements() {
        return [ DynamicChannelPrimaryMessageEditModalDescription ];
    }
}
