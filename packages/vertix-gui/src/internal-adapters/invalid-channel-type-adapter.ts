import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIAdapterService } from "@vertix.gg/gui/src/ui-adapter-service";

import type { BaseGuildTextChannel } from "discord.js";

export class InvalidChannelTypeAdapter extends UIAdapterBase<BaseGuildTextChannel, UIDefaultButtonChannelVoiceInteraction> {
    public static getName() {
        return "VertixGUI/InternalAdapters/InvalidChannelTypeAdapter";
    }

    public static getComponent() {
        const Component = ServiceLocator.$.get<UIAdapterService>( "VertixGUI/UIAdapterService" ).$$
            .getSystemComponents().InvalidChannelTypeComponent;

        if ( ! Component ) {
            throw new Error( "InvalidChannelTypeComponent not found" );
        }

        return Component;
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs ) {
        return {
            channelTypes: argsFromManager.channelTypes,
        };
    }

    protected shouldDisableMiddleware(): boolean {
        return true;
    }
}
