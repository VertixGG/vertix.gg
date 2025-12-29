import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelTemplatesEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-embed";
import { DynamicChannelTemplatesElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-elements-group";
import { DynamicChannelTemplatesSavedEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/save/dynamic-channel-templates-saved-embed";
import { DynamicChannelTemplatesAppliedEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/apply/dynamic-channel-templates-applied-embed";
import { DynamicChannelTemplatesApplyElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/apply/dynamic-channel-templates-apply-elements-group";
import { DynamicChannelTemplatesApplyConfirmElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/apply/dynamic-channel-templates-apply-confirm-elements-group";
import { DynamicChannelTemplatesManageEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-manage-embed";
import { DynamicChannelTemplatesManageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-manage-elements-group";
import { DynamicChannelTemplatesManageConfirmElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-manage-confirm-elements-group";
import { DynamicChannelTemplatesDeletedEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/manage/dynamic-channel-templates-deleted-embed";
import { DynamicChannelTemplatesSaveModal } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/save/dynamic-channel-templates-save-modal";

export class DynamicChannelTemplatesComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTemplatesEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTemplatesSavedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTemplatesAppliedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTemplatesManageEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTemplatesDeletedEmbed )
        ];
    }

    public static getElementsGroups() {
        return [
            DynamicChannelTemplatesElementsGroup,
            DynamicChannelTemplatesApplyElementsGroup,
            DynamicChannelTemplatesApplyConfirmElementsGroup,
            DynamicChannelTemplatesManageElementsGroup,
            DynamicChannelTemplatesManageConfirmElementsGroup
        ];
    }

    public static getModals() {
        return [ DynamicChannelTemplatesSaveModal ];
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup";
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup";
    }

    public static getDefaultMarkdownsGroup() {
        return null;
    }
}

