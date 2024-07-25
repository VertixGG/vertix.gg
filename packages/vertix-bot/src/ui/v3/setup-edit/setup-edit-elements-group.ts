import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { SetupEditSelectEditOptionMenu } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-select-edit-option-menu";

import { DoneButton } from "@vertix.gg/bot/src/ui/v3/_general/done-button";

import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/v3/config-extras/config-extras-select-menu";

import { LogChannelSelectMenu } from "@vertix.gg/bot/src/ui/v3/logs-channel/log-channel-select-menu";

export class SetupEditElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/SetupEditElementsGroup";
    }

    public static getItems() {
        return [
            [ SetupEditSelectEditOptionMenu ],
            [ ConfigExtrasSelectMenu ],
            [ LogChannelSelectMenu ],
            [ DoneButton ],
        ];
    }
}