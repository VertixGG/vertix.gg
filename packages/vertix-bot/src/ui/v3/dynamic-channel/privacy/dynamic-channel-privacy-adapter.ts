import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { Message, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction =
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction |
    UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelPrivacyAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelPrivacyAdapter"
)
    .setComponent( DynamicChannelPrivacyComponent )
    .setInitiatorElement( DynamicChannelPrivacyButton )
    .setExecutionSteps( {
        default: {
            elementsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyMenuGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyEmbedGroup"
        }
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => getArgsWithPermissions( interaction.channel ) )
    .getEditMessageArgs( async( _context, message?: Message<true> ) =>
        message ? getArgsWithPermissions( message.channel as VoiceChannel ) : {}
    )
    .onEntityMap( async( { bindSelectMenu } ) => {
        bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>(
            "VertixBot/UI-V3/DynamicChannelPrivacyMenu",
            async( context, interaction ) => {
                const state = interaction.values[ 0 ];

                context.setArgs( interaction, { state } );

                const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                await dynamicChannelService.editChannelPrivacyState(
                    interaction,
                    interaction.channel,
                    state as "public" | "private" | "hidden"
                );

                await context.editReply( interaction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPrivacyFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Public",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Public",
                            executionStep: "default"
                        },
                        mutations: [
                            { type: "set", path: [ "state" ] }
                        ]
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPrivacyFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Private",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Private",
                            executionStep: "default"
                        },
                        mutations: [
                            { type: "set", path: [ "state" ] }
                        ]
                    },
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelPrivacyFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Hidden",
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Hidden",
                            executionStep: "default"
                        },
                        mutations: [
                            { type: "set", path: [ "state" ] }
                        ]
                    }
                ]
            }
        );
    } )
    .build();

async function getArgsWithPermissions( channel: VoiceChannel ) {
    const args: UIArgs = {};
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const allowedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        true
    );

    args.allowedUsers = allowedUsers;
    args.blockedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        false
    );
    args.state = await dynamicChannelService.getChannelPrivacyState( channel );

    return args;
}

export { DynamicChannelPrivacyAdapter };
