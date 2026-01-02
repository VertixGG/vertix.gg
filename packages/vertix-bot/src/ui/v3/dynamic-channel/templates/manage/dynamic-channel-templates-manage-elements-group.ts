import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelTemplatesDeleteSelectMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-delete-select-menu";
import { DynamicChannelTemplatesBackButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/elements/dynamic-channel-templates-back-button";

export class DynamicChannelTemplatesManageElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesManageElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelTemplatesDeleteSelectMenu ],
            [ DynamicChannelTemplatesBackButton ]
        ];
    }
}

