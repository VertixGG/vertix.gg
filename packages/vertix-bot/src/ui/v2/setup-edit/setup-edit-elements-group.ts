import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";

import { SetupEditSelectEditOptionMenu } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-select-edit-option-menu";

import { LogChannelSelectMenu } from "@vertix.gg/bot/src/ui/v2/logs-channel/log-channel-select-menu";

export class SetupEditElementsGroup extends UIElementsGroupBase {
    public static getName () {
        return "Vertix/UI-V2/SetupEditElementsGroup";
    }

    public static getItems () {
        return [ [ SetupEditSelectEditOptionMenu ], [ ConfigExtrasSelectMenu ], [ LogChannelSelectMenu ], [ DoneButton ] ];
    }
}
