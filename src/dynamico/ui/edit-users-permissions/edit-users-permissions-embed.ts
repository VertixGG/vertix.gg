import {
    Interaction,
} from "discord.js";

import UIEmbedTemplate from "@dynamico/ui/_base/ui-embed-template";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { dynamicChannelManager } from "@dynamico/managers";

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
            cloudNotRemoveUser: uiUtilsWrapAsTemplate( "cloudNotRemoveUser" ),

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
                [ this.vars.mange ]: "🔒 Manage users access for your dynamic channel",
                [ this.vars.nothingChanged ]: "🤷 Hmm.. nothing changed",
                [ this.vars.canNowConnect ]: `☝ ${ this.vars.username } can now connect to your channel`,
                [ this.vars.removedFromYourList ] : `👇 ${ this.vars.username } removed from your list`,
                [ this.vars.couldNotAddUser ]: `Could not add user ${ this.vars.username }`,
                [ this.vars.cloudNotRemoveUser ]: `Could not remove user ${ this.vars.username }`,
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
        const allowed = await dynamicChannelManager.getChannelAllowedUserIds( interaction ),
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
}

export default EditUsersPermissionsEmbed;
