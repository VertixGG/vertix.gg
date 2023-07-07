import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

/**
 * Shown when the user changed his vote from one user to another.
 */
export class ClaimResultVoteUpdatedEmbed extends UIEmbedBase {
    private static vars = {
        prevUserId: uiUtilsWrapAsTemplate( "prevUserId" ),
        currentUserId: uiUtilsWrapAsTemplate( "currentUserId" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimResultVoteUpdatedEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "🗳️  Your vote has been updated";
    }

    protected getDescription() {
        const { prevUserId, currentUserId } = ClaimResultVoteUpdatedEmbed.vars;

        return `You've just changed your vote from <@${ prevUserId }> to <@${ currentUserId }> for channel ownership.`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            prevUserId: args.prevUserId,
            currentUserId: args.currentUserId,
        };
    }
}
