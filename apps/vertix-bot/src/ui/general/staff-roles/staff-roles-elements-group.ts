import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { StaffRolesMenu } from "@vertix.gg/bot/src/ui/general/staff-roles/staff-roles-menu";
import { StaffRolesClearButton } from "@vertix.gg/bot/src/ui/general/staff-roles/staff-roles-clear-button";
import { ServerOptionsBackButton } from "@vertix.gg/bot/src/ui/general/server-options/server-options-back-button";

const StaffRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/StaffRolesElementsGroup" )
    .addRow( [ StaffRolesMenu ] )
    .addRow( [ StaffRolesClearButton, ServerOptionsBackButton ] )
    .build();

export { StaffRolesElementsGroup };
