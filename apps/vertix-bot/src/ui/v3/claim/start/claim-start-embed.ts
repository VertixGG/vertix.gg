import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_START_EMBED_VARS = {
    ownerId: uiUtilsWrapAsTemplate( "ownerId" ),
    ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),
    absentMinutes: uiUtilsWrapAsTemplate( "absentMinutes" )
};

const ClaimStartEmbed = new EmbedBuilder<UIArgs>(
    "VertixBot/UI-V3/ClaimStartEmbed",
    CLAIM_START_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( () => `👋  ${ CLAIM_START_EMBED_VARS.ownerDisplayName } abandoned his channel!` )
    .setDescription( () =>
        `<@${ CLAIM_START_EMBED_VARS.ownerId }> has been absent for more than ${ CLAIM_START_EMBED_VARS.absentMinutes } minutes.\n` +
        "Will you be the one to take charge? Step up and claim it for yourself!"
    )
    .setLogic( ( args ) => {
        const { ownerDisplayName, ownerId, absentInterval } = args;
        return {
            ownerId,
            ownerDisplayName,
            absentMinutes: ( absentInterval / 60000 ).toFixed( 1 )
        };
    } )
    .build();

export { ClaimStartEmbed, CLAIM_START_EMBED_VARS };
