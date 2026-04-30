import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_RESULT_OWNER_STOP_VARS = {
    absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" )
};

export const ClaimResultOwnerStopEmbed = new EmbedBuilder<UIArgs, typeof CLAIM_RESULT_OWNER_STOP_VARS>(
    "VertixBot/UI-V3/ClaimResultOwnerStopEmbed",
    CLAIM_RESULT_OWNER_STOP_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "👑  You're back in charge!" )
    .setDescription( () =>
        `Please be aware that if you don't return within **${ CLAIM_RESULT_OWNER_STOP_VARS.absentMinutes }** minutes, the channel will once again become available for other members to claim.\n`
    )
    .setLogic( ( args: UIArgs ) => ( {
        absentMinutes: ( args.absentInterval / 60000 ).toFixed( 1 )
    } ) )
    .build();
