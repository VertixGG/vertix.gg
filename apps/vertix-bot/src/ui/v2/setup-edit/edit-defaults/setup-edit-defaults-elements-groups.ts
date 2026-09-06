import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { DefaultPrivacyStateMenu } from "@vertix.gg/bot/src/ui/general/master-defaults/default-privacy-state-menu";
import { DefaultUserLimitMenu } from "@vertix.gg/bot/src/ui/general/master-defaults/default-user-limit-menu";
import { DefaultPrivacyResetButton } from "@vertix.gg/bot/src/ui/general/master-defaults/default-privacy-reset-button";
import { DefaultUserLimitInheritButton } from "@vertix.gg/bot/src/ui/general/master-defaults/default-user-limit-inherit-button";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

const backButton = () => {
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    return uiService.$$.getSystemElements().WizardBackButton;
};

const SetupEditDefaultPrivacyElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditDefaultPrivacyElementsGroup" )
    .setItems( () => [ [ DefaultPrivacyStateMenu ], [ DefaultPrivacyResetButton, backButton() ] ] )
    .build();

const SetupEditDefaultUserLimitElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V2/SetupEditDefaultUserLimitElementsGroup" )
    .setItems( () => [ [ DefaultUserLimitMenu ], [ DefaultUserLimitInheritButton, backButton() ] ] )
    .build();

export { SetupEditDefaultPrivacyElementsGroup, SetupEditDefaultUserLimitElementsGroup };
