import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v2/channel-buttons-template/channel-buttons-template-select-menu";

import { SetupEditButtonsScopeSelectMenu } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-scope-select-menu";
import { SetupEditButtonsRoleSelectMenu } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-role-select-menu";
import { SetupEditButtonsClearRoleOverrideButton } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-clear-role-override-button";
import { SetupEditButtonsUpdateExistingButton } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-update-existing-button";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

// Lazily, because the back button is a system element that is not registered yet while this module
// is being evaluated.
const SetupEditButtonsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditButtonsElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();

        return [
            [ SetupEditButtonsScopeSelectMenu ],
            [ SetupEditButtonsRoleSelectMenu ],
            [ ChannelButtonsTemplateSelectMenu ],
            [ SetupEditButtonsClearRoleOverrideButton, SetupEditButtonsUpdateExistingButton, WizardBackButton ]
        ];
    } )
    .build();

export { SetupEditButtonsElementsGroup };
