import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

/**
 * Shown when the user successfully vote.
 */
export class ClaimResultVotedEmbed extends UIEmbedBase {
    private static vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
        userId: uiUtilsWrapAsTemplate( "userId" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimResultVotedEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return `🗳️  You have voted for ${ ClaimResultVotedEmbed.vars.userDisplayName }`;
    }

    protected getDescription() {
        return `Your vote has been cast in favor of <@${ ClaimResultVotedEmbed.vars.userId }> taking ownership of this channel.`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            userDisplayName: args.userDisplayName,
            userId: args.userId,
        };
    }
}
