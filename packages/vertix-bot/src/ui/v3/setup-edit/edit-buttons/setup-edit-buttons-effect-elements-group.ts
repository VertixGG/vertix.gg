import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import {
    SetupEditButtonsEffectImmediatelyButton
} from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-effect-immediately-button";
import {
    SetupEditButtonsEffectNewlyButton
} from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-effect-newly-button";

import {
    ChannelButtonsTemplateSelectMenu
} from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";

export class SetupEditButtonsEffectElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/SetupEditButtonsEffectElementsGroup";
    }

    public static getItems() {
        return [
            [ ChannelButtonsTemplateSelectMenu ],
            [ SetupEditButtonsEffectImmediatelyButton, SetupEditButtonsEffectNewlyButton ],
        ];
    }
}
