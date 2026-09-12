import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { dynamicChannelRequirements } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/_dynamic-channel-requirements";
import {
    answerClaimPressedFromControlPanel
} from "@vertix.gg/bot/src/ui/general/claim-in-channel-only/claim-in-channel-only-gate";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { Message, MessageComponentInteraction, ModalSubmitInteraction, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

export abstract class DynamicChannelAdapterExuBase<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction
> extends UIAdapterExecutionStepsBase<UIAdapterStartContext, TInteraction> {
    protected dynamicChannelService: DynamicChannelService | null;

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelAdapterExuBase";
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel", { silent: true } ) ?? null;
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    public getPermissions() {
        return new PermissionsBitField( 0n );
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ): Promise<boolean> {
        if ( await answerClaimPressedFromControlPanel( interaction, this.getPressedEntityName( interaction ) ) ) {
            return false;
        }

        const channel = await this.resolveTargetChannel( interaction );

        return ( await dynamicChannelRequirements( interaction, channel ) ) ?? false;
    }

    /**
     * Function getPressedEntityName() :: Which entity of this adapter was pressed.
     *
     * Read out of the custom id the same way `run()` does, so what is asked about here is exactly
     * what is about to be dispatched.
     */
    protected getPressedEntityName( interaction: TInteraction ): string | null {
        if ( ! ( "customId" in interaction ) ) {
            return null;
        }

        return this.getCustomIdForEntity( interaction.customId ).split( UI_CUSTOM_ID_SEPARATOR )[ 1 ] ?? null;
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

        return this.dynamicChannelService!.resolveTargetChannel( interaction, args );
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
        const channel = await this.dynamicChannelService!.resolveTargetChannel( message, args );

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
