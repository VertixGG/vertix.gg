import { BaseGuildTextChannel } from "discord.js";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import { UIDefaultButtonChannelVoiceInteraction } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import {
    MissingPermissionsComponent
} from "@vertix/ui-v2/_general/missing-permissions/missing-permissions-component";

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
