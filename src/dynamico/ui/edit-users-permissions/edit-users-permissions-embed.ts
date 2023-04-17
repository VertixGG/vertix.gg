import {
    ChannelType,
    Interaction,
    OverwriteType
} from "discord.js";

import UIEmbedTemplate from "@dynamico/ui/base/ui-embed-template";

import GlobalLogger from "@dynamico/global-logger";

import { masterChannelManager } from "@dynamico/managers";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

export class EditUsersPermissionsEmbed extends UIEmbedTemplate {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/EditUserPermissions/EditUserPermissionsEmbed";
    }

    public constructor() {
        super();

        this.vars = {
            private: uiUtilsWrapAsTemplate( "private" ),
            public: uiUtilsWrapAsTemplate( "public" ),
            mange: uiUtilsWrapAsTemplate( "mange" ),
            nothingChanged: uiUtilsWrapAsTemplate( "nothingChanged" ),
            canNowConnect: uiUtilsWrapAsTemplate( "canNowConnect" ),
            removedFromYourList: uiUtilsWrapAsTemplate( "removedFromYourList" ),
            couldNotAddUser: uiUtilsWrapAsTemplate( "couldNotAddUser" ),

            title: uiUtilsWrapAsTemplate( "title" ),
            userId: uiUtilsWrapAsTemplate( "userId" ),
            userIds: uiUtilsWrapAsTemplate( "userIds" ),

            username: uiUtilsWrapAsTemplate( "username" ),
        };
    }

    protected getTemplateOptions(): any {
        return {
            title: {
                [ this.vars.private ]: "🚫 Your channel is private now!",
                [ this.vars.mange ]: "👥 Manage users access for your dynamic channel",
                [ this.vars.nothingChanged ]: "🤷 Hmm.. nothing changed",
                [ this.vars.canNowConnect ]: `☝ ${ this.vars.username } can now connect to your channel`,
                [ this.vars.removedFromYourList ] : `👇 ${ this.vars.username } removed from your list`,
                [ this.vars.couldNotAddUser ]: `Could not add user ${ this.vars.username }`,
            }
        };
    }

    protected getTemplateInputs() {
        let description = "Allowed:\n" + this.vars.userIds + "\n\nWho should have access to your channel?";

        return {
            type: "embed",
            title: this.vars.title,
            description,
            userWrapper: `<@${ this.vars.userId }>`,
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

export default EditUsersPermissionsEmbed;
