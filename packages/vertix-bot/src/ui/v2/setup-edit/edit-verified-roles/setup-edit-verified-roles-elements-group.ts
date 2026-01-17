import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";
import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";

import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

const SetupEditVerifiedRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditVerifiedRolesElementsGroup" )
    .setItems( (): Array<Array<typeof UIElementBase>> => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton, WizardFinishButton } = uiService.$$.getSystemElements();

        return [
            [ VerifiedRolesMenu ],
            [ VerifiedRolesEveryoneSelectMenu ],
            [ WizardBackButton as typeof UIElementBase, WizardFinishButton as typeof UIElementBase ]
        ];
    } )
    .build();

export { SetupEditVerifiedRolesElementsGroup };
