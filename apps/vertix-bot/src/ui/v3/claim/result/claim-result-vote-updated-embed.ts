import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_RESULT_VOTE_UPDATED_VARS = {
    prevUserId: uiUtilsWrapAsTemplate( "prevUserId" ),
    currentUserId: uiUtilsWrapAsTemplate( "currentUserId" )
};

export const ClaimResultVoteUpdatedEmbed = new EmbedBuilder<UIArgs, typeof CLAIM_RESULT_VOTE_UPDATED_VARS>(
    "VertixBot/UI-V3/ClaimResultVoteUpdatedEmbed",
    CLAIM_RESULT_VOTE_UPDATED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "🗳️  Your vote has been updated" )
    .setDescription( () => {
        const { prevUserId, currentUserId } = CLAIM_RESULT_VOTE_UPDATED_VARS;
        return `You've just changed your vote from <@${ prevUserId }> to <@${ currentUserId }> for channel ownership.`;
    } )
    .setLogic( ( args: UIArgs ) => ( {
        prevUserId: args.prevUserId,
        currentUserId: args.currentUserId
    } ) )
    .build();
