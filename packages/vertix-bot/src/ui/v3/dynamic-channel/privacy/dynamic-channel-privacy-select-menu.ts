import { DynamicChannelStringMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-string-menu-base";

import type { APISelectMenuOption } from "discord.js";

export class DynamicChannelPrivacySelectMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrivacyMenu";
    }

    public getId(): string {
        return "dynamic-channel-privacy-select-menu";
    }

    protected async getPlaceholder() {
        return "⛉ ∙ Select Privacy State";
    }

    protected async getSelectOptions() {
        return [
            {
                label: "Public",
                value: "public",
                emoji: "🌐"
            },
            {
                label: "Private",
                value: "private",
                emoji: "🚫"
            },
            {
                label: "Hidden",
                value: "hidden",
                emoji: "🙈"
            }
            // TODO:
            // {
            //     label: "Limit speak to trusted users only",
            //     value: "limit-speak",
            //     emoji: "🔒",
            // },
        ] as APISelectMenuOption[];
    }
}
