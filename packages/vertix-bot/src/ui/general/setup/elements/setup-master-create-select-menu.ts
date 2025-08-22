import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupMasterCreateSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/SetupMasterCreateSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "➕ ∙ Create Master Channel";
    }

    protected async getMinValues() {
        return 1;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions() {
        return [
            { label: "Create Master Channel (V2)", value: "V2", emoji: "➕" },
            { label: "Create Master Channel (V3)", value: "V3", emoji: "➕" },
            { label: "Create Master Scaling Channel", value: "SCALING", emoji: "➕" }
        ];
    }
}


