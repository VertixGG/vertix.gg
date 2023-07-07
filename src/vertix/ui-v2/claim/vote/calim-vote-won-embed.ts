import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedElapsedTimeBase } from "@vertix/ui-v2/_base/ui-embed-time-elapsed-base";

import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { ClaimVoteResultsMarkdown } from "@vertix/ui-v2/claim/vote/claim-vote-results-markdown";

export class ClaimVoteWonEmbed extends UIEmbedElapsedTimeBase {
    private static vars: any = {
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
        resultsDefault: uiUtilsWrapAsTemplate( "resultsDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ClaimVoteWonEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getEndTime( args: UIArgs ): Date {
        return new Date( Date.now() + args.elapsedTime );
    }

    protected getTitle() {
        return `👑  ${ ClaimVoteWonEmbed.vars.userWonDisplayName } has claimed the channel`;
    }

    protected getDescription() {
        return ClaimVoteWonEmbed.vars.wonMessage;
    }

    protected getOptions() {
        const {
            userWonId,

            previousOwnerDisplayName,

            results,
            resultsLink,
            resultsDefault,

            wonSameOwner,
            wonSomeoneElse
        } = ClaimVoteWonEmbed.vars;

        return {
            "wonMessage": {
                [ wonSomeoneElse]: `<@${ userWonId }> has claimed ownership of this channel, superseding ~~${ previousOwnerDisplayName }~~ as the new owner!${ results }`,
                [ wonSameOwner ]: `<@${ userWonId }> has claimed ownership of this channel, he was already the owner! 😊${ results }`
            },

            "results": {
                [ resultsDefault ]: "",
                [ resultsLink ]: `\n\nFor more details click [here](${ resultsLink })`,
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {};

        result.userWonId = args.userWonId;
        result.userWonDisplayName = args.userWonDisplayName;

        result.previousOwnerId = args.previousOwnerId;
        result.previousOwnerDisplayName = args.previousOwnerDisplayName;

        result.candidatesCount = Object.keys( args.results || {} ).length;

        const resultsLink = ClaimVoteResultsMarkdown.pullout( this.uiArgs?.markdownCode );

        if ( result.userWonId === result.previousOwnerId ) {
            result.wonMessage = ClaimVoteWonEmbed.vars.wonSameOwner;
        } else {
            result.wonMessage = ClaimVoteWonEmbed.vars.wonSomeoneElse;
        }

        if ( resultsLink ) {
            result.resultsLink = resultsLink;
            result.results = ClaimVoteWonEmbed.vars.resultsLink;
        } else {
            result.results = ClaimVoteWonEmbed.vars.resultsDefault;
        }

        return result;
    }
}
