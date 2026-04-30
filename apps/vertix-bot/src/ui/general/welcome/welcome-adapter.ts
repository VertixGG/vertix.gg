import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui/general/welcome/welcome-component";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { BaseMessageOptions, InteractionReplyOptions, VoiceChannel } from "discord.js";
import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type WelcomeInteraction = UIDefaultButtonChannelVoiceInteraction;

async function replyEphemeral(
    interaction: WelcomeInteraction | UIDefaultStringSelectMenuChannelTextInteraction,
    payload: InteractionReplyOptions
) {
    const message = { ...payload, ephemeral: true };

    if ( interaction.replied || interaction.deferred ) {
        await interaction.followUp( message );
    } else {
        await interaction.reply( message );
    }
}

const WelcomeAdapterBase = new AdminExecutionAdapterBuilder<
    VoiceChannel,
    WelcomeInteraction,
    UIArgs
>( "VertixBot/UI-General/WelcomeAdapter" )
    .setComponent( WelcomeComponent )
    .setPermissions( new PermissionsBitField( PermissionFlagsBits.ViewChannel ) )
    .setChannelTypes( [ ChannelType.GuildVoice, ChannelType.GuildText ] )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async() => ( {} ) )
    .defineTransactions( tx => {
        tx.setInitialState( "Initial" )
            .addState( "Initial", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-General/WelcomeElementsGroup"
            } )
            .addTransition( "ClickSetup", { from: "Initial", to: "Initial" } )
            .addTransition( "NoOp", { from: "Initial", to: "Initial" } )
            .addHandoffPoint( {
                flowName: "VertixBot/UI-General/SetupFlow",
                description: "Handoff to Setup flow when Setup button is clicked",
                sourceState: "VertixBot/UI-General/WelcomeFlow/States/Initial",
                transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-General/WelcomeSetupButton",
                transitionName: "ClickSetup",
                targetFlowName: "VertixBot/UI-General/SetupFlow"
            } )
            .bindButton<WelcomeInteraction>(
                "VertixBot/UI-General/WelcomeSetupButton",
                "ClickSetup",
                async( context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService.get( "VertixBot/UI-General/SetupAdapter" )?.ephemeral( interaction );
                    context.deleteArgs( interaction );
                }
            )
            .bindButton<WelcomeInteraction>(
                "VertixBot/UI-General/WelcomeSupportButton",
                "NoOp",
                async( _context, interaction ) => {
                    await replyEphemeral( interaction, {
                        content: "Support link/info coming soon. (Placeholder)",
                        components: []
                    } );
                }
            )
            .bindButton<WelcomeInteraction>(
                "VertixBot/UI-General/WelcomeInviteButton",
                "NoOp",
                async( _context, interaction ) => {
                    await replyEphemeral( interaction, {
                        content: "Invite link coming soon. (Placeholder)",
                        components: []
                    } );
                }
            );
    } )
    .build();

export class WelcomeAdapter extends WelcomeAdapterBase {
    public override getPermissions() {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel );
    }

    public override getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected override getMessage(
        from: UIAdapterBuildSource,
        context: VoiceChannel | UIDefaultButtonChannelVoiceInteraction,
        argsFromManager: UIArgs = {}
    ): BaseMessageOptions {
        const result = super.getMessage( from, context, argsFromManager );

        if ( argsFromManager?.userId && from === "send" ) {
            result.content = "<@" + argsFromManager.userId + ">";
        }

        return result;
    }
}
