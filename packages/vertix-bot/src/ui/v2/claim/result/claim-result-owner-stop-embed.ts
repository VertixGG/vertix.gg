import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" )
};

const ClaimResultOwnerStopEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/ClaimResultOwnerStopEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "👑  You're back in charge!" )
    .setDescription( `Please be aware that if you don't return within **${ vars.absentMinutes }** minutes, the channel will once again become available for other members to claim.\n` )
    .setLogic( ( args: UIArgs ) => ( {
        absentMinutes: ( args.absentInterval / 60000 ).toFixed( 1 )
    } ) )
    .setDefaultVars( () => ( {
        absentMinutes: "5.0"
    } ) )
    .build();

export { ClaimResultOwnerStopEmbed };
