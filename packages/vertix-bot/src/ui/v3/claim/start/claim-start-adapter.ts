import { ChannelType, PermissionsBitField } from "discord.js";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

export class ClaimStartAdapter extends UIAdapterBase<VoiceChannel, DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V3/ClaimStartAdapter";
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async getStartArgs( channel: VoiceChannel, argsFromManager: UIArgs ) {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! channelDB || ! channelDB.userOwnerId ) {
            return {};
        }

        return {
            ownerId: channelDB.userOwnerId,
            channelId: channel.id,
            ownerDisplayName: await guildGetMemberDisplayName( channel.guild, channelDB.userOwnerId ),
            absentInterval: DynamicChannelClaimManager.get( "Vertix/UI-V3/DynamicChannelClaimManager" )
                .getChannelOwnershipTimeout(),
        };
    }

    protected onEntityMap() {
        this.bindButton<DefaultInteraction>( "Vertix/UI-V3/ClaimStartButton", this.onClaimStartButtonClicked );
    }

    private async onClaimStartButtonClicked( interaction: DefaultInteraction ) {
        await DynamicChannelClaimManager.get( "Vertix/UI-V3/DynamicChannelClaimManager" )
            .handleVoteRequest( interaction );
    }
}
