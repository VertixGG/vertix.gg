import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { BaseGuildTextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class MissingPermissionsAdapter extends UIAdapterBase<
    BaseGuildTextChannel,
    UIDefaultButtonChannelVoiceInteraction
> {
    public static getName () {
        return "VertixGUI/InternalAdapters/MissingPermissionsAdapter";
    }

    public static getComponent () {
        const Component =
            ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).$$.getSystemComponents().MissingPermissionsComponent;

        if ( !Component ) {
            throw new Error( "MissingPermissionsComponent not found" );
        }

        return Component;
    }

    protected getReplyArgs ( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs ) {
        return {
            omitterDisplayName: argsFromManager.omitterDisplayName || interaction.member.displayName,
            missingPermissions: argsFromManager.missingPermissions
        };
    }

    protected shouldDisableMiddleware (): boolean {
        return true;
    }
}
