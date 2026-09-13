import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { LfmChannelsSelectMenu } from "@vertix.gg/bot/src/ui/v2/lfm-channels/lfm-channels-select-menu";
import { LfmPingRolesSelectMenu } from "@vertix.gg/bot/src/ui/v2/lfm-channels/lfm-ping-roles-select-menu";

import { SetupEditLfmTimingsButton }
    from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-lfm-channels/setup-edit-lfm-timings-button";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

const SetupEditLfmChannelsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditLfmChannelsElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();

        return [
            [ LfmChannelsSelectMenu ],
            [ LfmPingRolesSelectMenu ],
            [ WizardBackButton, SetupEditLfmTimingsButton ]
        ];
    } )
    .build();

export { SetupEditLfmChannelsElementsGroup };
