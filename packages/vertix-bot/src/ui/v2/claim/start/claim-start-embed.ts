import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    ownerId: uiUtilsWrapAsTemplate( "ownerId" ),
    ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),
    absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" )
};

const ClaimStartEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimStartEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => `👋  ${ vars.ownerDisplayName } abandoned his channel!` )
    .setDescription( () => (
        `<@${ vars.ownerId }> has been absent for more than ${ vars.absentMinutes } minutes.\n` +
        "Will you be the one to take charge? Step up and claim it for yourself!"
    ) )
    .setLogic( ( args: UIArgs ) => ( {
        ownerId: args.ownerId,
        ownerDisplayName: args.ownerDisplayName,
        absentMinutes: ( args.absentInterval / 60000 ).toFixed( 1 )
    } ) )
    .setDefaultVars( () => ( {
        ownerId: "123456789",
        ownerDisplayName: "User",
        absentMinutes: "5.0"
    } ) )
    .build();

export { ClaimStartEmbed };
