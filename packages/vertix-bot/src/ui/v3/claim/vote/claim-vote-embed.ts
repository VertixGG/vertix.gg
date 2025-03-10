import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedElapsedTimeBase } from "@vertix.gg/gui/src/bases/ui-embed-time-elapsed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Shown when there at least two candidates for a claim.
 */
export class ClaimVoteEmbed extends UIEmbedElapsedTimeBase {
    private static vars: any = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        userInitiatorId: uiUtilsWrapAsTemplate( "userInitiatorId" ),

        candidates: uiUtilsWrapAsTemplate( "candidates" ),
        candidatesCount: uiUtilsWrapAsTemplate( "candidatesCount" ),
        candidatesState: uiUtilsWrapAsTemplate( "candidatesState" ),
        candidatesDefault: uiUtilsWrapAsTemplate( "candidatesDefault" ),

        userId: uiUtilsWrapAsTemplate( "userId" ),
        votes: uiUtilsWrapAsTemplate( "votes" )
    };

    public static getName () {
        return "Vertix/UI-V3/ClaimVoteEmbed";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected getEndTime ( args: UIArgs ): Date {
        return new Date( args.timeEnd );
    }

    protected getTitle () {
        return `👑  ${ ClaimVoteEmbed.vars.candidatesCount } Candidates wish to claim this channel`;
    }

    protected getDescription () {
        const { userInitiatorId, candidatesState } = ClaimVoteEmbed.vars;

        return (
            "The countdown is on!\n" +
            `In just \`${ this.getElapsedTimeFormatFractionVariable() }\`, the voting will come to a close.\n` +
            `In case of a tie, <@${ userInitiatorId }> will become the new owner.\n` +
            "\n" +
            candidatesState
        );
    }

    protected getOptions () {
        const { candidates, candidatesDefault } = ClaimVoteEmbed.vars;

        return {
            candidatesState: {
                [ candidates ]: "🏅 " + candidates,
                [ candidatesDefault ]: "There are no candidates yet."
            }
        };
    }

    protected getArrayOptions () {
        const { value, separator, userId, votes } = ClaimVoteEmbed.vars;

        return {
            candidates: {
                format: value + separator,
                separator: " - ",
                multiSeparator: "\n",
                options: {
                    userId: `<@${ userId }>`,
                    votes: `${ votes } Votes`
                }
            }
        };
    }

    protected getLogic ( args: UIArgs ) {
        const result: any = {},
            candidates = Object.entries( args.results || {} )
                .map( ( [ userId, votes ] ) => {
                    return {
                        userId,
                        votes: votes as number
                    };
                } )
                .sort( ( a, b ) => {
                    return b.votes - a.votes;
                } );

        result.candidatesCount = candidates.length;
        result.userInitiatorId = args.userInitiatorId;

        if ( result.candidatesCount ) {
            result.candidates = candidates;
            result.candidatesState = ClaimVoteEmbed.vars.candidates;
        } else {
            result.candidatesState = ClaimVoteEmbed.vars.candidatesDefault;
        }

        return result;
    }
}
