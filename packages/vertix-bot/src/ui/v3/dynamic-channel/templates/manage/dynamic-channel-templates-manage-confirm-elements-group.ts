import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelTemplatesDeleteSelectMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-delete-select-menu";
import { DynamicChannelTemplatesDeleteConfirmButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-delete-confirm-button";
import { DynamicChannelTemplatesBackButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/elements/dynamic-channel-templates-back-button";

export class DynamicChannelTemplatesManageConfirmElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesManageConfirmElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelTemplatesDeleteSelectMenu ],
            [ DynamicChannelTemplatesDeleteConfirmButton, DynamicChannelTemplatesBackButton ]
        ];
    }
}

