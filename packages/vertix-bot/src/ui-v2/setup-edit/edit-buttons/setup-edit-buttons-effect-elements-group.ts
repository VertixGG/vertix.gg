import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import {
    SetupEditButtonsEffectImmediatelyButton
} from "@vertix.gg/bot/src/ui-v2/setup-edit/edit-buttons/setup-edit-buttons-effect-immediately-button";
import {
    SetupEditButtonsEffectNewlyButton
} from "@vertix.gg/bot/src/ui-v2/setup-edit/edit-buttons/setup-edit-buttons-effect-newly-button";

import {
    ChannelButtonsTemplateSelectMenu
} from "@vertix.gg/bot/src/ui-v2/channel-buttons-template/channel-buttons-template-select-menu";

export class SetupEditButtonsEffectElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditButtonsEffectElementsGroup";
    }

    public static getItems() {
        return [
            [ ChannelButtonsTemplateSelectMenu ],
            [ SetupEditButtonsEffectImmediatelyButton, SetupEditButtonsEffectNewlyButton ],
        ];
    }
}
