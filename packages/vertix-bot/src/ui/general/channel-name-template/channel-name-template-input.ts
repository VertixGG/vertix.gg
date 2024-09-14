import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class ChannelNameTemplateInput extends UIElementInputBase {
    private config = ConfigManager.$
        .get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 );

    public static getName() {
        return "VertixBot/UI-General/ChannelNameTemplateInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "SET DEFAULT DYNAMIC CHANNELS NAME";
    }

    protected async getPlaceholder(): Promise<string> {
        return this.config.data.settings.dynamicChannelNameTemplate;
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.dynamicChannelNameTemplate ||
            this.content?.placeholder ||
            this.config.data.settings.dynamicChannelNameTemplate;
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 50;
    }
}
