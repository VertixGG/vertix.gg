import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelTemplatesApplySelectMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/apply/dynamic-channel-templates-apply-select-menu";
import { DynamicChannelTemplatesBackButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/elements/dynamic-channel-templates-back-button";

export class DynamicChannelTemplatesApplyElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesApplyElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelTemplatesApplySelectMenu ],
            [ DynamicChannelTemplatesBackButton ]
        ];
    }
}

