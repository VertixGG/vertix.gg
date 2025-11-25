import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_RESULT_VOTED_VARS = {
    userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
    userId: uiUtilsWrapAsTemplate( "userId" )
};

export const ClaimResultVotedEmbed = new EmbedBuilder<UIArgs, typeof CLAIM_RESULT_VOTED_VARS>(
    "VertixBot/UI-V3/ClaimResultVotedEmbed",
    CLAIM_RESULT_VOTED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => `🗳️  You have voted for ${ CLAIM_RESULT_VOTED_VARS.userDisplayName }` )
    .setDescription( () =>
        `Your vote has been cast in favor of <@${ CLAIM_RESULT_VOTED_VARS.userId }> taking ownership of this channel.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        userDisplayName: args.userDisplayName,
        userId: args.userId
    } ) )
    .build();
