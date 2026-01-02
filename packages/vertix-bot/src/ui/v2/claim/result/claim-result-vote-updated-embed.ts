import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
        prevUserId: uiUtilsWrapAsTemplate( "prevUserId" ),
        currentUserId: uiUtilsWrapAsTemplate( "currentUserId" )
    };

const ClaimResultVoteUpdatedEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimResultVoteUpdatedEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => "🗳️  Your vote has been updated" )
    .setDescription( () => `You've just changed your vote from <@${ vars.prevUserId }> to <@${ vars.currentUserId }> for channel ownership.` )
    .setLogic( ( args: UIArgs ) => ( {
            prevUserId: args.prevUserId,
            currentUserId: args.currentUserId
    } ) )
    .setDefaultVars( () => ( {
        prevUserId: "123456789",
        currentUserId: "987654321"
    } ) )
    .build();

export { ClaimResultVoteUpdatedEmbed };
