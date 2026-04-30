import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_VOTE_STEP_IN_VARS = {
    userInitiatorId: uiUtilsWrapAsTemplate( "userInitiatorId" ),
    userInitiatorDisplayName: uiUtilsWrapAsTemplate( "userInitiatorDisplayName" ),
    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" )
};

const ClaimVoteStepInEmbed = new ElapsedEmbedBuilder<UIArgs, typeof CLAIM_VOTE_STEP_IN_VARS>(
    "VertixBot/UI-V3/ClaimVoteStepInEmbed",
    CLAIM_VOTE_STEP_IN_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( args.timeEnd ) )
    .setTitle( () => `👑  ${ CLAIM_VOTE_STEP_IN_VARS.userInitiatorDisplayName } wish to claim this channel` )
    .setDescription( () =>
        `Unless someone else steps up, <@${ CLAIM_VOTE_STEP_IN_VARS.userInitiatorId }> will be the proud owner of this channel in just \`${ CLAIM_VOTE_STEP_IN_VARS.elapsedTimeFormatFraction }\`.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        userInitiatorId: args.userInitiatorId,
        userInitiatorDisplayName: args.userInitiatorDisplayName
    } ) )
    .build();

export { ClaimVoteStepInEmbed };
