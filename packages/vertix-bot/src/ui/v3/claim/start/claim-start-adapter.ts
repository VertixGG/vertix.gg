import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ChannelType, PermissionsBitField } from "discord.js";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

const ClaimStartAdapter = new AdapterBuilderBase<
    VoiceChannel,
    DefaultInteraction,
        typeof UIAdapterBase<VoiceChannel, DefaultInteraction>,
        UIArgs,
        IAdapterContext<DefaultInteraction, UIArgs>
>( "VertixBot/UI-V3/ClaimStartAdapter", UIAdapterBase )
    .setComponent( ClaimStartComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
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
    .onEntityMap( async( { bindButton } ) => {
        bindButton<DefaultInteraction>(
            "VertixBot/UI-V3/ClaimStartButton",
            async( _context, interaction ) => {
                await DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" )
                    .handleVoteRequest( interaction );
            }
        );
    } )
    .build();

export { ClaimStartAdapter };
