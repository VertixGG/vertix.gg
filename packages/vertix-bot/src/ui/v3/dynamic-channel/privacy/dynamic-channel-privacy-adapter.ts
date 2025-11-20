import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";
import { DynamicChannelAdapterExuWithPermissionsBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-with-permissions-base";
import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { Message, VoiceChannel } from "discord.js";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelPrivacyAdapter = new ExecutionAdapterBuilder<
        VoiceChannel,
        DefaultInteraction,
        UIArgs,
        typeof DynamicChannelAdapterExuWithPermissionsBase<DefaultInteraction>
    >( "VertixBot/UI-V3/DynamicChannelPrivacyAdapter", DynamicChannelAdapterExuWithPermissionsBase as any )
    .setComponent( DynamicChannelPrivacyComponent )
    .setInitiatorElement( DynamicChannelPrivacyButton )
    .setExecutionSteps( {
        default: {}
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => getArgsWithPermissions( interaction.channel ) )
    .getEditMessageArgs( async( _context, message?: Message<true> ) =>
        message ? getArgsWithPermissions( message.channel as VoiceChannel ) : {}
    )
    .onEntityMap( async( { bindSelectMenu } ) => {
        bindSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelPrivacyMenu",
            async( context, interaction ) => {
                const state = interaction.values[ 0 ];

                await ServiceLocator.$
                    .get( "VertixBot/Services/DynamicChannel" )
                    .editChannelPrivacyState(
                        interaction,
                        interaction.channel,
                        state as "public" | "private" | "hidden"
                    );

                await context.editReply( interaction );
            }
        );
    } )
    .build();

async function getArgsWithPermissions( channel: VoiceChannel ) {
    const args: UIArgs = {};
    const dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );

    const { allowedUsers, blockedUsers } = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        true
    );

    args.allowedUsers = allowedUsers;
    args.blockedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        false
    ).then( r => r.blockedUsers );
    args.state = await dynamicChannelService.getChannelPrivacyState( channel );

    return args;
}

export { DynamicChannelPrivacyAdapter };
