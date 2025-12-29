import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelTemplatesCaptureButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/elements/dynamic-channel-templates-capture-button";
import { DynamicChannelTemplatesApplyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/elements/dynamic-channel-templates-apply-button";
import { DynamicChannelTemplatesManageButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/elements/dynamic-channel-templates-manage-button";

export class DynamicChannelTemplatesElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelTemplatesCaptureButton, DynamicChannelTemplatesApplyButton, DynamicChannelTemplatesManageButton ]
        ];
    }
}

