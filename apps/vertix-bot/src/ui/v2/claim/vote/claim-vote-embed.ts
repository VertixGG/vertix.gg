import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    userInitiatorId: uiUtilsWrapAsTemplate( "userInitiatorId" ),

    candidates: uiUtilsWrapAsTemplate( "candidates" ),
    candidatesCount: uiUtilsWrapAsTemplate( "candidatesCount" ),
    candidatesState: uiUtilsWrapAsTemplate( "candidatesState" ),
    candidatesDefault: uiUtilsWrapAsTemplate( "candidatesDefault" ),

    userId: uiUtilsWrapAsTemplate( "userId" ),
    votes: uiUtilsWrapAsTemplate( "votes" ),

    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" )
};

const ClaimVoteEmbed = new ElapsedEmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimVoteEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( args.timeEnd ) )
    .setTitle( `👑  ${ vars.candidatesCount } Candidates wish to claim this channel` )
    .setDescription(
        "The countdown is on!\n" +
        `In just \`${ vars.elapsedTimeFormatFraction }\` , the voting will come to a close.\n` +
        `In case of a tie, <@${ vars.userInitiatorId }> will become the new owner.\n` +
        "\n" +
        vars.candidatesState
    )
    .setOptions( {
        candidatesState: {
            [ vars.candidates ]: "🏅 " + vars.candidates,
            [ vars.candidatesDefault ]: "There are no candidates yet."
        }
    } )
    .setArrayOptions( {
        candidates: {
            format: vars.value + vars.separator,
            separator: " - ",
            multiSeparator: "\n",
            options: {
                userId: `<@${ vars.userId }>`,
                votes: `${ vars.votes } Votes`
            }
        }
    } )
    .setLogic( ( args: UIArgs ) => {
        const result: any = {};

        const candidates = Object.entries( args.results || {} )
            .map( ( [ userId, votes ] ) => ( {
                userId,
                votes: votes as number
            } ) )
            .sort( ( a, b ) => b.votes - a.votes );

        result.candidatesCount = candidates.length;
        result.userInitiatorId = args.userInitiatorId;

        if ( result.candidatesCount ) {
            result.candidates = candidates;
            result.candidatesState = vars.candidates;
        } else {
            result.candidatesState = vars.candidatesDefault;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        candidatesCount: "2",
        userInitiatorId: "123456789",
        candidatesState: "🏅 <@123456789> - 1 Votes\n🏅 <@987654321> - 0 Votes",
        elapsedTimeFormatFraction: "1.5 minutes"
    } ) )
    .build();

export { ClaimVoteEmbed };
