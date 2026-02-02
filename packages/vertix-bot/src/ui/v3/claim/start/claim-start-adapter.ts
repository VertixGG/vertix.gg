import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

async function onClaimStartButtonClicked(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: DefaultInteraction
) {
    await DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" )
        .handleVoteRequest( interaction );
}

const ClaimStartAdapter = new ExecutionAdapterBuilder<VoiceChannel, DefaultInteraction>(
    "VertixBot/UI-V3/ClaimStartAdapter"
)
    .setComponent( ClaimStartComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: {
                    ownerId: "123456789",
                    ownerDisplayName: "Owner",
                    absentInterval: "300000"
                }
            } )
            .addTransition( "RequestClaim", {
                from: "Default",
                to: "Default"
            } )
            .bindButton<DefaultInteraction>( "VertixBot/UI-V3/ClaimStartButton", "RequestClaim", onClaimStartButtonClicked );
    } )
    .getStartArgs( async( context, channel ) => {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !channelDB || !channelDB.userOwnerId ) {
            return {};
        }

        return {
            ownerId: channelDB.userOwnerId,
            channelId: channel.id,
            ownerDisplayName: await guildGetMemberDisplayName( channel.guild, channelDB.userOwnerId ),
            absentInterval: DynamicChannelClaimManager.get(
                "VertixBot/UI-V3/DynamicChannelClaimManager"
            ).getChannelOwnershipTimeout()
        };
    } )
    .build();

export { ClaimStartAdapter };
