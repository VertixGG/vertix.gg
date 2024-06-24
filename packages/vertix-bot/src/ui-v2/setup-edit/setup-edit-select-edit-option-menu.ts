import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIElementStringSelectMenu } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-string-select-menu";

export class SetupEditSelectEditOptionMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/SetupEditSelectEditOptionMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "◎ ∙ Select Edit Option";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions() {
        return [{
            label: "∙ Edit Channel's Name",
            value: "edit-dynamic-channel-name",
            emoji: "#️⃣" as any,
        }, {
            label: "∙ Edit Channel's Buttons",
            value: "edit-dynamic-channel-buttons",
            emoji: "🎚" as any,
        }, {
            label: "∙ Edit Channel's Verified Roles",
            value: "edit-dynamic-channel-verified-roles",
            emoji: "🛡️" as any,
        }];
    }
}
