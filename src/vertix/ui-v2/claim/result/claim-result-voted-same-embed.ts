import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

/**
 * Shown when user vote for the same user.
 */
export class ClaimResultVotedSameEmbed extends UIEmbedBase {
    private static vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
        userId: uiUtilsWrapAsTemplate( "userId" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimResultVotedSameEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return `🗳️  You already voted for ${ ClaimResultVotedSameEmbed.vars.userDisplayName }`;
    }

    protected getDescription() {
        return `Your vote has been already cast in favor of <@${ ClaimResultVotedSameEmbed.vars.userId }>, you can vote for someone else if you changed your mind.`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            userDisplayName: args.userDisplayName,
            userId: args.userId,
        };
    }
}
