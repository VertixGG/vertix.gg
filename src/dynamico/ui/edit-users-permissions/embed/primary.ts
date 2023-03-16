import {
    ChannelType,
    Interaction,
    OverwriteType
} from "discord.js";

import UITemplate from "@dynamico/ui/base/ui-template";

import GlobalLogger from "@dynamico/global-logger";

import { masterChannelManager } from "@dynamico/managers";

export class Primary extends UITemplate {
    public static getName() {
        return "Dynamico/UI/EditUserPermissions/Embeds/Primary";
    }

    protected getTemplateOptions(): any {
        return {
            title: {
                "%{private}%": "🚫 Your channel is private now!",
                "%{public}%": "🌐 Your channel is public now!",
                "%{mange}%": "👥 Manage users access for your dynamic channel",
                "%{cannotAddYourSelf}%": "You cannot add yourself",
                "%{canNowConnect}%": "☝ %{username}% can now connect to your channel",
                "%{removedFromYourList}%": "👇 %{username}% removed from your list",
            }
        };
    }

    protected getTemplateInputs() {
        let description = "Allowed:\n" + "%{userIds}%" + "\n\nWho should have access to your channel?";

        return {
            type: "embed",
            title: "%{title}%",
            description,
            userWrapper: "<@%{userId}%>",
            separator: ", ",
        };
    }

    protected async getTemplateLogic( interaction: Interaction, args: any ) {
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
            ...args,

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

        const masterChannel = await masterChannelManager.getByDynamicChannel( interaction );

        if ( ! masterChannel ) {
            GlobalLogger.getInstance().warn( this.getName(),
                `Master channel does not exist for dynamic channel '${ interaction.channel?.id }'` );

            return [];
        }

        const masterChannelCache = interaction.client.channels.cache.get( masterChannel.id ),
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
