import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

export const MASTER_CHANNEL_TYPE_V2 = "v2";
export const MASTER_CHANNEL_TYPE_V3 = "v3";
export const MASTER_CHANNEL_TYPE_SCALING = "scaling";

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
        return 0;
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        return [
            {
                label: "Dynamic Channel (V2)",
                value: MASTER_CHANNEL_TYPE_V2,
                emoji: { name: "➕" },
                description: "Classic dynamic voice channels"
            },
            {
                label: "Dynamic Channel (V3)",
                value: MASTER_CHANNEL_TYPE_V3,
                emoji: { name: "✨" },
                description: "Enhanced dynamic channels with more features"
            },
            {
                label: "Auto-Scaling Channel",
                value: MASTER_CHANNEL_TYPE_SCALING,
                emoji: { name: "📈" },
                description: "Automatically scales based on member count"
            }
        ];
    }
}

