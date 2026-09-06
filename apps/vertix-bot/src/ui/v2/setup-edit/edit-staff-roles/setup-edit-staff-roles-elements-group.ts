import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { StaffRolesMenu } from "@vertix.gg/bot/src/ui/general/staff-roles/staff-roles-menu";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

const SetupEditStaffRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditStaffRolesElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();

        return [
            [ StaffRolesMenu ],
            [ WizardBackButton ]
        ];
    } )
    .build();

export { SetupEditStaffRolesElementsGroup };
