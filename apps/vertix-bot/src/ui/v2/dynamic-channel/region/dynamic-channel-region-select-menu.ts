import { DEFAULT_RTC_REGIONS } from "@vertix.gg/definitions/src/rtc-region-definitions";

import { DynamicChannelStringMenuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-string-menu-base";

import type { APISelectMenuOption } from "discord.js";

/**
 * Where a channel is hosted, on the older interface.
 *
 * The regions themselves are the shared list both interfaces read, so the two cannot come to
 * disagree about what `us-west` is called.
 */
export class DynamicChannelRegionSelectMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelRegionSelectMenu";
    }

    public getId(): number {
        return 17;
    }

    protected async getPlaceholder() {
        return "⌖ ∙ Select Region";
    }

    protected async getSelectOptions() {
        return Object.entries( DEFAULT_RTC_REGIONS ).map( ( [ label, value ] ) => {
            return {
                label,
                value: value ?? "auto"
            };
        } ) as APISelectMenuOption[];
    }
}
