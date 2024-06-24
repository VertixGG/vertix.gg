import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import {
    MissingPermissionsComponent
} from "@vertix.gg/bot/src/ui-v2/_general/missing-permissions/missing-permissions-component";

import type { BaseGuildTextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";

export class MissingPermissionsAdapter extends UIAdapterBase<BaseGuildTextChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "Vertix/UI-V2/MissingPermissionsAdapter";
    }

    public static getComponent() {
        return MissingPermissionsComponent;
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs ) {
        return {
            omitterDisplayName: argsFromManager.omitterDisplayName || interaction.member.displayName,
            missingPermissions: argsFromManager.missingPermissions,
        };
    }

    protected shouldDisableMiddleware(): boolean {
        return true;
    }
}
