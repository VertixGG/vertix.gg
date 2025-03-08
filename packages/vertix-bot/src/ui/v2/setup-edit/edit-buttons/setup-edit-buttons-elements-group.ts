import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v2/channel-buttons-template/channel-buttons-template-select-menu";

export class SetupEditButtonsElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V2/SetupEditButtonsElementsGroup";
    }

    public static getItems() {
        return [[ChannelButtonsTemplateSelectMenu], [DoneButton]];
    }
}
