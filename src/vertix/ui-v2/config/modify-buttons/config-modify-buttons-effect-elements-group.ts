import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";
import { ButtonsSelectMenu } from "@vertix/ui-v2/buttons/buttons-select-menu";

import {
    ConfigModifyButtonsEffectImmediatelyButton
} from "@vertix/ui-v2/config/modify-buttons/config-modify-buttons-effect-immediately-button";

import { ConfigModifyButtonsEffectNewlyButton } from "@vertix/ui-v2/config/modify-buttons/config-modify-buttons-effect-newly-button";

export class ConfigModifyButtonsEffectElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/ConfigModifyButtonsEffectElementsGroup";
    }

    public static getItems() {
        return [
            [ ButtonsSelectMenu ],
            [ ConfigModifyButtonsEffectImmediatelyButton, ConfigModifyButtonsEffectNewlyButton ],
        ];
    }
}
