import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ClaimStartButton } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-button";
import { ClaimStartEmbed } from "@vertix.gg/bot/src/ui/v3/claim/start/claim-start-embed";

const ClaimStartComponent = new ComponentBuilder( "VertixBot/UI-V3/ClaimStartComponent" )
    .addElements( [ ClaimStartButton ] )
    .addEmbed( ClaimStartEmbed )
    .setInstanceType( UIInstancesTypes.Static )
    .build();

export { ClaimStartComponent };
