import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { ElapsedEmbedBuilder } from "@vertix.gg/gui/src/builders/elapsed-embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    userInitiatorId: uiUtilsWrapAsTemplate( "userInitiatorId" ),
    userInitiatorDisplayName: uiUtilsWrapAsTemplate( "userInitiatorDisplayName" ),
    elapsedTimeFormatFraction: uiUtilsWrapAsTemplate( "elapsedTimeFormatFraction" )
};

const ClaimVoteStepInEmbed = new ElapsedEmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimVoteStepInEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setEndTime( ( args ) => new Date( args.timeEnd ) )
    .setTitle( `👑  ${ vars.userInitiatorDisplayName } wish to claim this channel` )
    .setDescription(
        `Unless someone else steps up, <@${ vars.userInitiatorId }> will be the proud owner of this channel in just \`${ vars.elapsedTimeFormatFraction }\`.`
    )
    .setLogic( ( args: UIArgs ) => {
        return {
            userInitiatorId: args.userInitiatorId,
            userInitiatorDisplayName: args.userInitiatorDisplayName
        };
    } )
    .setDefaultVars( () => ( {
        userInitiatorId: "123456789",
        userInitiatorDisplayName: "User",
        elapsedTimeFormatFraction: "1.0 minutes"
    } ) )
    .build();

export { ClaimVoteStepInEmbed };
