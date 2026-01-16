import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ChannelType, PermissionsBitField } from "discord.js";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/_dynamic-channel-requirements";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type {
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { Message, MessageComponentInteraction, ModalSubmitInteraction, VoiceChannel } from "discord.js";
import type DynamicChannelService from "@vertix.gg/bot/src/services/dynamic-channel-service";

export abstract class DynamicChannelAdapterBase extends UIAdapterBase<
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
> {
    protected static logger = new Logger( this.getName() );

    protected dynamicChannelService: DynamicChannelService;

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelAdapterBase";
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    public getPermissions() {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal( interaction: UIDefaultButtonChannelVoiceInteraction ): Promise<boolean> {
        const channel = await this.resolveTargetChannel( interaction );

        return ( await dynamicChannelRequirements( interaction, channel ) ) ?? false;
    }

    public async run( interaction: MessageComponentInteraction | ModalSubmitInteraction ) {
        await this.hydrateInteractionChannel( interaction as UIDefaultButtonChannelVoiceInteraction );

        return super.run( interaction );
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        await this.hydrateMessageChannel( message, newArgs );

        return super.editMessage( message, newArgs );
    }

    protected async resolveTargetChannel( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        return this.dynamicChannelService.resolveTargetChannel( interaction, args );
    }

    protected async hydrateInteractionChannel( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const channel = await this.resolveTargetChannel( interaction );

        if ( !channel ) {
            return;
        }

        this.applyResolvedChannelToInteraction( interaction, channel );
    }

    protected async hydrateMessageChannel( message: Message<true>, newArgs?: UIArgs ) {
        const args = newArgs ?? this.getArgsManager().getArgs( this, message );
        const channel = await this.dynamicChannelService.resolveTargetChannel( message, args );

        if ( !channel ) {
            return;
        }

        try {
            Object.defineProperty( message, "channel", { value: channel } );
        } catch {
        }
    }

    private applyResolvedChannelToInteraction( interaction: UIDefaultButtonChannelVoiceInteraction, channel: VoiceChannel ) {
        if ( interaction.channel?.id === channel.id ) {
            return;
        }

        try {
            Object.defineProperty( interaction, "channel", { value: channel } );
        } catch {
        }

        try {
            Object.defineProperty( interaction, "channelId", { value: channel.id } );
        } catch {
        }
    }
}
