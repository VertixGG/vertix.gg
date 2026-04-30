import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ClaimVoteResultsMarkdown } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-results-markdown";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_VOTE_WON_VARS = {
    userWonId: uiUtilsWrapAsTemplate( "userWonId" ),
    userWonDisplayName: uiUtilsWrapAsTemplate( "userWonDisplayName" ),
    previousOwnerId: uiUtilsWrapAsTemplate( "previousOwnerId" ),
    previousOwnerDisplayName: uiUtilsWrapAsTemplate( "previousOwnerDisplayName" ),
    candidatesCount: uiUtilsWrapAsTemplate( "candidatesCount" ),
    wonMessage: uiUtilsWrapAsTemplate( "wonMessage" ),
    wonSameOwner: uiUtilsWrapAsTemplate( "wonSameOwner" ),
    wonSomeoneElse: uiUtilsWrapAsTemplate( "wonSomeoneElse" ),
    results: uiUtilsWrapAsTemplate( "results" ),
    resultsLink: uiUtilsWrapAsTemplate( "resultsLink" ),
    resultsDefault: uiUtilsWrapAsTemplate( "resultsDefault" )
};

const ClaimVoteWonEmbed = new ElapsedEmbedBuilder<UIArgs, typeof CLAIM_VOTE_WON_VARS>(
    "VertixBot/UI-V3/ClaimVoteWonEmbed",
    CLAIM_VOTE_WON_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( Date.now() + args.elapsedTime ) )
    .setTitle( () => `👑  ${ CLAIM_VOTE_WON_VARS.userWonDisplayName } has claimed the channel` )
    .setDescription( () => CLAIM_VOTE_WON_VARS.wonMessage )
    .setOptions( () => ( {
        wonMessage: {
            [ CLAIM_VOTE_WON_VARS.wonSomeoneElse ]: `<@${ CLAIM_VOTE_WON_VARS.userWonId }> has claimed ownership of this channel, superseding ~~${ CLAIM_VOTE_WON_VARS.previousOwnerDisplayName }~~ as the new owner!${ CLAIM_VOTE_WON_VARS.results }`,
            [ CLAIM_VOTE_WON_VARS.wonSameOwner ]: `<@${ CLAIM_VOTE_WON_VARS.userWonId }> has claimed ownership of this channel, he was already the owner! 😊${ CLAIM_VOTE_WON_VARS.results }`
        },
        results: {
            [ CLAIM_VOTE_WON_VARS.resultsDefault ]: "",
            [ CLAIM_VOTE_WON_VARS.resultsLink ]: `\n\nFor more details click [here](${ CLAIM_VOTE_WON_VARS.resultsLink })`
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const resultsLink = ClaimVoteResultsMarkdown.pullout( args.markdownCode );
        const sameOwner = args.userWonId === args.previousOwnerId;

        return {
            userWonId: args.userWonId,
            userWonDisplayName: args.userWonDisplayName,
            previousOwnerId: args.previousOwnerId,
            previousOwnerDisplayName: args.previousOwnerDisplayName,
            candidatesCount: Object.keys( args.results || {} ).length,
            wonMessage: sameOwner ? CLAIM_VOTE_WON_VARS.wonSameOwner : CLAIM_VOTE_WON_VARS.wonSomeoneElse,
            resultsLink: resultsLink ?? undefined,
            results: resultsLink ? CLAIM_VOTE_WON_VARS.resultsLink : CLAIM_VOTE_WON_VARS.resultsDefault
        };
    } )
    .build();

export { ClaimVoteWonEmbed };
