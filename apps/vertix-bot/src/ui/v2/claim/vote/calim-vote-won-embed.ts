import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ClaimVoteResultsMarkdown } from "@vertix.gg/bot/src/ui/v2/claim/vote/claim-vote-results-markdown";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
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

const ClaimVoteWonEmbed = new ElapsedEmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimVoteWonEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( Date.now() + ( args.elapsedTime || 0 ) ) )
    .setTitle( `👑  ${ vars.userWonDisplayName } has claimed the channel` )
    .setDescription( vars.wonMessage )
    .setOptions( {
        wonMessage: {
            [ vars.wonSomeoneElse ]: `<@${ vars.userWonId }> has claimed ownership of this channel, superseding ~~${ vars.previousOwnerDisplayName }~~ as the new owner!${ vars.results }`,
            [ vars.wonSameOwner ]: `<@${ vars.userWonId }> has claimed ownership of this channel, he was already the owner! 😊${ vars.results }`
        },
        results: {
            [ vars.resultsDefault ]: "",
            [ vars.resultsLink ]: `\n\nFor more details click [here](${ vars.resultsLink })`
        }
    } )
    .setLogic( ( args: UIArgs ) => {
        const result: any = {};

        result.userWonId = args.userWonId;
        result.userWonDisplayName = args.userWonDisplayName;

        result.previousOwnerId = args.previousOwnerId;
        result.previousOwnerDisplayName = args.previousOwnerDisplayName;

        result.candidatesCount = Object.keys( args.results || {} ).length;

        const resultsLink = ClaimVoteResultsMarkdown.pullout( args.markdownCode );

        if ( result.userWonId === result.previousOwnerId ) {
            result.wonMessage = vars.wonSameOwner;
        } else {
            result.wonMessage = vars.wonSomeoneElse;
        }

        if ( resultsLink ) {
            result.resultsLink = resultsLink;
            result.results = vars.resultsLink;
        } else {
            result.results = vars.resultsDefault;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        userWonId: "123456789",
        userWonDisplayName: "New Owner",
        previousOwnerId: "987654321",
        previousOwnerDisplayName: "Old Owner",
        wonMessage: "wonSomeoneElse",
        results: "resultsDefault"
    } ) )
    .build();

export { ClaimVoteWonEmbed };
