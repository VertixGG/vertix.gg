import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { VoiceRoleMenu } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-menu";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

const SetupEditVoiceRoleElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditVoiceRoleElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();

        return [
            [ VoiceRoleMenu ],
            [ WizardBackButton ]
        ];
    } )
    .build();

export { SetupEditVoiceRoleElementsGroup };
