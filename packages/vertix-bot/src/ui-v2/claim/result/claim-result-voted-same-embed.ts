import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

/**
 * Shown when user vote for the same user.
 */
export class ClaimResultVotedSameEmbed extends UIEmbedBase {
    private static vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
        userId: uiUtilsWrapAsTemplate( "userId" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/ClaimResultVotedSameEmbed";
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
