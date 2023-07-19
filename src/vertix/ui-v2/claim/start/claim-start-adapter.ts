import { ButtonInteraction, ChannelType, PermissionsBitField, VoiceChannel } from "discord.js";

import { ChannelModel } from "@vertix-base/models/channel-model";

import { ClaimStartComponent } from "@vertix/ui-v2/claim/start/claim-start-component";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix/utils/guild";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

export class ClaimStartAdapter extends UIAdapterBase<VoiceChannel, DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V2/ClaimStartAdapter";
    }

    public static getComponent() {
        return ClaimStartComponent;
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( 0n );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice
        ];
    }

    protected async getStartArgs( channel: VoiceChannel, argsFromManager: UIArgs ) {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! channelDB || ! channelDB.userOwnerId ) {
            return {};
        }

        return {
            ownerId: channelDB.userOwnerId,
            channelId: channel.id,
            ownerDisplayName: await guildGetMemberDisplayName( channel.guild, channelDB.userOwnerId ),
            absentInterval: DynamicChannelClaimManager.$.getChannelOwnershipTimeout(),
        };
    }

    protected onEntityMap() {
        this.bindButton<DefaultInteraction>( "Vertix/UI-V2/ClaimStartButton", this.onClaimStartButtonClicked );
    }

    private async onClaimStartButtonClicked( interaction: DefaultInteraction ) {
        await DynamicChannelClaimManager.$.handleVoteRequest( interaction );
    }
}
