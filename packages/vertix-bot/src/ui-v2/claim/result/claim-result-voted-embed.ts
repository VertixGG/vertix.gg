import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

/**
 * Shown when the user successfully vote.
 */
export class ClaimResultVotedEmbed extends UIEmbedBase {
    private static vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
        userId: uiUtilsWrapAsTemplate( "userId" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/ClaimResultVotedEmbed";
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
