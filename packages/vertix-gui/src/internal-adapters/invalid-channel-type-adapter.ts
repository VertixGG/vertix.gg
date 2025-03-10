import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { BaseGuildTextChannel } from "discord.js";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class InvalidChannelTypeAdapter extends UIAdapterBase<
    BaseGuildTextChannel,
    UIDefaultButtonChannelVoiceInteraction
> {
    public static getName () {
        return "VertixGUI/InternalAdapters/InvalidChannelTypeAdapter";
    }

    public static getComponent () {
        const Component =
            ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).$$.getSystemComponents().InvalidChannelTypeComponent;

        if ( !Component ) {
            throw new Error( "InvalidChannelTypeComponent not found" );
        }

        return Component;
    }

    protected getReplyArgs ( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs ) {
        return {
            channelTypes: argsFromManager.channelTypes
        };
    }

    protected shouldDisableMiddleware (): boolean {
        return true;
    }
}
