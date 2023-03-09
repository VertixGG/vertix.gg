import {
    ChannelType,
    Interaction,
    OverwriteType
} from "discord.js";

import UITemplate from "@dynamico/ui/base/ui-template";

import GlobalLogger from "@dynamico/global-logger";

import { MasterChannelManager } from "@dynamico/managers";

export class Primary extends UITemplate {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions/Embeds/Primary";
    }

    protected getTemplateInputs() {
        let description = "Allowed:\n" + "%{userIds}%" + "\n\nWho should have access to your channel?";

        return {
            type: "embed",
            description,
            userWrapper: "<@%{userId}%>",
            separator: ", " // This is a comma.
        };
    }

    protected async getTemplateLogic( interaction: Interaction ) {
        const allowed = await this.getAllowedUserIds( interaction ),
            { separator, userWrapper } = this.getTemplateInputs();

        let userIds = "";

        const arrayLength = allowed.length;

        for ( let i = 0 ; i < arrayLength ; i++ ) {
            const userId = this.compile( { userWrapper }, { userId: allowed[ i ] } ).userWrapper;

            userIds += userId;

            // If not the end item.
            if ( i !== arrayLength - 1 ) {
                userIds += separator;
            }
        }

        return {
            userIds
        };
    }

    private async getAllowedUserIds( interaction: Interaction ) {
        if ( ! interaction.channel || interaction.channel.type !== ChannelType.GuildVoice ) {
            GlobalLogger.getInstance().error( this.getName(),
                `Interaction channel is not a voice channel. Channel type: ${interaction.type}`
            );

            return [];
        }

        const masterChannel = await MasterChannelManager.getInstance().getByDynamicChannel( interaction, true ),
            masterChannelCache = interaction.client.channels.cache.get( masterChannel.id ),
            allowed = [];

        for ( const role of interaction.channel.permissionOverwrites?.cache?.values() || [] ) {
            if ( role.type !== OverwriteType.Member ) {
                continue;
            }

            // Show only users that are not in the master channel permission overwrites.
            if ( masterChannelCache?.type === ChannelType.GuildVoice &&
                masterChannelCache.permissionOverwrites.cache.has( role.id ) ) {
                continue;
            }

            allowed.push( role.id );
        }

        return allowed;
    }
}

export default Primary;
