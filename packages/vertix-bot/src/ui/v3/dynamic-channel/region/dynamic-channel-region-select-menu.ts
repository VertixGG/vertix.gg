import { DEFAULT_RTC_REGIONS } from "@vertix.gg/base/src/definitions/rtc-regions";

import { DynamicChannelStringMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-string-menu-base";

import type { APISelectMenuOption } from "discord.js";

export class DynamicChannelRegionSelectMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRegionSelectMenu";
    }

    public getId(): string {
        throw new Error("Method not implemented.");
    }

    protected async getPlaceholder() {
        return "⌖ ∙ Select Region";
    }

    protected async getSelectOptions() {
        return Object.entries( DEFAULT_RTC_REGIONS ).map( ( [ label, value ] ) => {
            return {
                label,
                value: value ?? "auto",
            };
        } ) as APISelectMenuOption[];
    }
}
