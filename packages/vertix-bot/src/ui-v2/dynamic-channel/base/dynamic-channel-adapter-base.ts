import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ChannelType, PermissionsBitField } from "discord.js";

import  { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/base/_dynamic-channel-requirements";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";
import type DynamicChannelService from "@vertix.gg/bot/src/services/dynamic-channel-service";

export abstract class DynamicChannelAdapterBase extends UIAdapterBase<VoiceChannel, UIDefaultButtonChannelVoiceInteraction> {
    protected static logger = new Logger( this.getName() );

    protected dynamicChannelService: DynamicChannelService;

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelAdapterBase";
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice,
        ];
    }

    public getPermissions() {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        return await dynamicChannelRequirements( interaction );
    }
}
