import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
    userId: uiUtilsWrapAsTemplate( "userId" )
};

const ClaimResultVotedSameEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimResultVotedSameEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( `🗳️  You already voted for ${ vars.userDisplayName }` )
    .setDescription( `Your vote has been already cast in favor of <@${ vars.userId }>, you can vote for someone else if you changed your mind.` )
    .setLogic( ( args: UIArgs ) => ( {
        userDisplayName: args.userDisplayName,
        userId: args.userId
    } ) )
    .setDefaultVars( () => ( {
        userDisplayName: "User",
        userId: "123456789"
    } ) )
    .build();

export { ClaimResultVotedSameEmbed };
