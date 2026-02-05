import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";

import { ChannelType, PermissionsBitField } from "discord.js";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/_dynamic-channel-requirements";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { Message, MessageComponentInteraction, ModalSubmitInteraction, VoiceChannel } from "discord.js";

export abstract class DynamicChannelAdapterWizardBase<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction
> extends UIWizardAdapterBase<UIAdapterStartContext, TInteraction> {
    protected dynamicChannelService: DynamicChannelService | null;

    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelAdapterWizardBase";
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel", { silent: true } ) ?? null;
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    public getPermissions() {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ): Promise<boolean> {
        const channel = await this.resolveTargetChannel( interaction );

        return ( await dynamicChannelRequirements( interaction, channel ) ) ?? false;
    }

    public async run( interaction: MessageComponentInteraction | ModalSubmitInteraction ) {
        await this.hydrateInteractionChannel( interaction as TInteraction );

        return super.run( interaction );
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        await this.hydrateMessageChannel( message, newArgs );

        return super.editMessage( message, newArgs );
    }

    protected async resolveTargetChannel( interaction: TInteraction ) {
        const args = this.getArgsManager().getArgs( this, interaction );

        return this.dynamicChannelService.resolveTargetChannel( interaction, args );
    }

    protected async hydrateInteractionChannel( interaction: TInteraction ) {
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

    private applyResolvedChannelToInteraction( interaction: TInteraction, channel: VoiceChannel ) {
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

    protected readonly shouldDeletePreviousReply = () => {
        return true;
    };
}
