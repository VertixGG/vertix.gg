import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";
import { VerifiedRolesClearButton } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-clear-button";
import { ServerOptionsBackButton } from "@vertix.gg/bot/src/ui/general/server-options/server-options-back-button";

const VerifiedRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/VerifiedRolesElementsGroup" )
    .addRow( [ VerifiedRolesMenu ] )
    .addRow( [ VerifiedRolesClearButton, ServerOptionsBackButton ] )
    .build();

export { VerifiedRolesElementsGroup };
