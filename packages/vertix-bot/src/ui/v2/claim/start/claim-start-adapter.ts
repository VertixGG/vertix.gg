import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui/v2/claim/start/claim-start-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

const CLAIM_START_STEPS = {
    default: {}
} as const;

async function onClaimStartButtonClicked(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: DefaultInteraction
) {
    await DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" ).handleVoteRequest( interaction );
}

const ClaimStartAdapter = new ExecutionAdapterBuilder<VoiceChannel, DefaultInteraction>(
    "VertixBot/UI-V2/ClaimStartAdapter"
)
    .setComponent( ClaimStartComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .setExecutionSteps( CLAIM_START_STEPS )
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
                to: "Default",
                triggeredBy: [ { sourceEntity: "VertixBot/UI-V2/ClaimStartButton", handlerKind: "button" } ]
            } );
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
                "VertixBot/UI-V2/DynamicChannelClaimManager"
            ).getChannelOwnershipTimeout()
        };
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<DefaultInteraction>( "VertixBot/UI-V2/ClaimStartButton", onClaimStartButtonClicked );
    } )
    .build();

export { ClaimStartAdapter };
