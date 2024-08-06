import {  Guild } from "discord.js";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import type { Base } from "discord.js";

export class UIGuildVersionStrategy extends UIVersionStrategyBase {
    public static getName() {
        return "VertixBase/VersionStrategies/UIGuildVersionStrategy";
    }

    public async determine(context?: Base) {
        if ( ! ( context instanceof Guild ) ) {
            return 0;
        }

        return await GuildDataManager.$.getUIVersion( context.id );
    }
}

export default UIGuildVersionStrategy;
