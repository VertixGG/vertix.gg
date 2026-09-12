import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { SetupClaimBackButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-claim-back-button";
import { SetupClaimResetButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-claim-reset-button";
import { SetupClaimSelectOptionMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-claim-select-option-menu";

const SetupClaimElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/SetupClaimElementsGroup" )
    .addRow( [ SetupClaimSelectOptionMenu ] )
    .addRow( [ SetupClaimResetButton, SetupClaimBackButton ] )
    .build();

export { SetupClaimElementsGroup };
