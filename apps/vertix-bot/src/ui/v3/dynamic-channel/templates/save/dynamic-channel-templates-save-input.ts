import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelTemplatesSaveInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesSaveInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<"short"> {
        return "short";
    }

    public async getLabel(): Promise<string> {
        return "TEMPLATE NAME";
    }

    protected async getPlaceholder(): Promise<string> {
        return "Enter a name for your template...";
    }

    protected async getMinLength(): Promise<number> {
        return 1;
    }

    protected async getMaxLength(): Promise<number> {
        return 32;
    }
}

