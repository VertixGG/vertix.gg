import { ChannelType, PermissionsBitField } from "discord.js";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { ClaimStartComponent } from "@vertix.gg/bot/src/ui-v2/claim/start/claim-start-component";

import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

export class ClaimStartAdapter extends UIAdapterBase<VoiceChannel, DefaultInteraction> {
    public static getName() {
        return "VertixBot/UI-V2/ClaimStartAdapter";
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
            absentInterval: DynamicChannelClaimManager.$.getChannelOwnershipTimeout(),
        };
    }

    protected onEntityMap() {
        this.bindButton<DefaultInteraction>( "VertixBot/UI-V2/ClaimStartButton", this.onClaimStartButtonClicked );
    }

    private async onClaimStartButtonClicked( interaction: DefaultInteraction ) {
        await DynamicChannelClaimManager.$.handleVoteRequest( interaction );
    }
}
