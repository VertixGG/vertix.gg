import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import { WelcomeComponent } from "@vertix.gg/bot/src/ui/general/welcome/welcome-component";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { BaseMessageOptions, InteractionReplyOptions, VoiceChannel } from "discord.js";
import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type WelcomeInteraction = UIDefaultButtonChannelVoiceInteraction;
type WelcomeContext = IAdapterContext<WelcomeInteraction, UIArgs>;

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

const WelcomeAdapterBase = new AdapterBuilderBase<
    VoiceChannel,
    WelcomeInteraction,
        typeof UIAdapterBase<VoiceChannel, WelcomeInteraction>,
        UIArgs,
        WelcomeContext
>( "VertixBot/UI-General/WelcomeAdapter", UIAdapterBase )
    .setComponent( WelcomeComponent )
    .setPermissions( new PermissionsBitField( PermissionFlagsBits.ViewChannel ) )
    .setChannelTypes( [ ChannelType.GuildVoice, ChannelType.GuildText ] )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async() => ( {} ) )
    .onEntityMap( async( { bindButton, bindSelectMenu } ) => {
        bindButton(
            "VertixBot/UI-General/WelcomeSetupButton",
            async( context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService.get( "VertixBot/UI-General/SetupAdapter" )?.ephemeral( interaction );
                context.deleteArgs( interaction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-General/WelcomeFlow",
                        transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup",
                        navigation: {
                            targetState: "VertixBot/UI-General/WelcomeFlow/States/SetupClicked"
                        }
                    }
                ]
            }
        );

        bindButton(
            "VertixBot/UI-General/WelcomeSupportButton",
            async( context, interaction ) => {
                await replyEphemeral( interaction, {
                    content: "Support link/info coming soon. (Placeholder)",
                    components: []
                } );
                context.deleteArgs( interaction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-General/WelcomeFlow",
                        transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport",
                        navigation: {
                            targetState: "VertixBot/UI-General/WelcomeFlow/States/SupportClicked"
                        }
                    }
                ]
            }
        );

        bindButton(
            "VertixBot/UI-General/WelcomeInviteButton",
            async( context, interaction ) => {
                await replyEphemeral( interaction, {
                    content: "Invite link coming soon. (Placeholder)",
                    components: []
                } );
                context.deleteArgs( interaction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-General/WelcomeFlow",
                        transition: "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite",
                        navigation: {
                            targetState: "VertixBot/UI-General/WelcomeFlow/States/InviteClicked"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/LanguageSelectMenu",
            async( context, interaction ) => {
                const selectedLanguage = interaction.values?.[ 0 ];

                if ( !selectedLanguage ) {
                    await replyEphemeral( interaction, {
                        content: "No language selected.",
                        components: []
                    } );
                    return;
                }

                context.setArgs( interaction, { selectedLanguage } );

                await replyEphemeral( interaction, {
                    content: `Language set to: \`${ selectedLanguage }\`.`,
                    components: []
                } );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-General/WelcomeFlow",
                        transition: "VertixBot/UI-General/WelcomeFlow/Transitions/SelectLanguage",
                        navigation: {
                            targetState: "VertixBot/UI-General/WelcomeFlow/States/LanguageSelected"
                        },
                        mutations: [
                            { type: "set", path: [ "selectedLanguage" ] }
                        ]
                    }
                ]
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
