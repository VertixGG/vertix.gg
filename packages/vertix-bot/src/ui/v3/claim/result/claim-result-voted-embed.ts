import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Shown when the user successfully vote.
 */
export class ClaimResultVotedEmbed extends UIEmbedBase {
    private static vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
        userId: uiUtilsWrapAsTemplate( "userId" )
    };

    public static getName() {
        return "VertixBot/UI-V3/ClaimResultVotedEmbed";
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
            userId: args.userId
        };
    }
}
