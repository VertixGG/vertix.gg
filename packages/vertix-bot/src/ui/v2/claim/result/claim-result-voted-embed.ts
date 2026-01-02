import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
        userDisplayName: uiUtilsWrapAsTemplate( "userDisplayName" ),
        userId: uiUtilsWrapAsTemplate( "userId" )
    };

const ClaimResultVotedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimResultVotedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => `🗳️  You have voted for ${ vars.userDisplayName }` )
    .setDescription( () => `Your vote has been cast in favor of <@${ vars.userId }> taking ownership of this channel.` )
    .setLogic( ( args: UIArgs ) => ( {
            userDisplayName: args.userDisplayName,
            userId: args.userId
    } ) )
    .setDefaultVars( () => ( {
        userDisplayName: "User",
        userId: "123456789"
    } ) )
    .build();

export { ClaimResultVotedEmbed };
