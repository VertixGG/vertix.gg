import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_VOTE_EMBED_VARS = {
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

const ClaimVoteEmbed = new ElapsedEmbedBuilder<UIArgs, typeof CLAIM_VOTE_EMBED_VARS>(
    "VertixBot/UI-V3/ClaimVoteEmbed",
    CLAIM_VOTE_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( args.timeEnd ) )
    .setTitle( () => `👑  ${ CLAIM_VOTE_EMBED_VARS.candidatesCount } Candidates wish to claim this channel` )
    .setDescription( () => (
        "The countdown is on!\n" +
        `In just \`${ CLAIM_VOTE_EMBED_VARS.elapsedTimeFormatFraction }\`, the voting will come to a close.\n` +
        `In case of a tie, <@${ CLAIM_VOTE_EMBED_VARS.userInitiatorId }> will become the new owner.\n\n` +
        CLAIM_VOTE_EMBED_VARS.candidatesState
    ) )
    .setOptions( () => ( {
        candidatesState: {
            [ CLAIM_VOTE_EMBED_VARS.candidates ]: "🏅 " + CLAIM_VOTE_EMBED_VARS.candidates,
            [ CLAIM_VOTE_EMBED_VARS.candidatesDefault ]: "There are no candidates yet."
        }
    } ) )
    .setArrayOptions( () => ( {
        candidates: {
            format: CLAIM_VOTE_EMBED_VARS.value + CLAIM_VOTE_EMBED_VARS.separator,
            separator: " - ",
            multiSeparator: "\n",
            options: {
                userId: `<@${ CLAIM_VOTE_EMBED_VARS.userId }>`,
                votes: `${ CLAIM_VOTE_EMBED_VARS.votes } Votes`
            }
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const candidates = Object.entries( args.results || {} )
            .map( ( [ userId, votes ] ) => ( {
                userId,
                votes: votes as number
            } ) )
            .sort( ( a, b ) => b.votes - a.votes );

        return {
            candidatesCount: candidates.length,
            userInitiatorId: args.userInitiatorId,
            candidates: candidates.length ? candidates : [],
            candidatesState: candidates.length ? CLAIM_VOTE_EMBED_VARS.candidates : CLAIM_VOTE_EMBED_VARS.candidatesDefault
        };
    } )
    .build();

export { ClaimVoteEmbed };
