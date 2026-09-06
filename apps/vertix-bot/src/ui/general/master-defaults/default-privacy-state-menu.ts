import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DefaultPrivacyStateMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/DefaultPrivacyStateMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "🛡️ ∙ Select Privacy State";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions() {
        return [
            {
                label: "∙ Public",
                value: "public",
                description: "Anyone in the audience can see and join",
                emoji: "🌐" as any
            },
            {
                label: "∙ Private",
                value: "private",
                description: "Visible, but only the owner lets people in",
                emoji: "🚫" as any
            },
            {
                label: "∙ Hidden",
                value: "hidden",
                description: "Not visible at all until the owner shows it",
                emoji: "🙈" as any
            }
        ];
    }
}
