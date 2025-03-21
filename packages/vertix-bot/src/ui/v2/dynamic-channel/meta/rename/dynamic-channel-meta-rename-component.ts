import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelMetaRenameModal } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-modal";

import {
    DynamicChannelMetaRenameBadwordEmbed,
    DynamicChannelMetaRenameLimitedEmbed,
    DynamicChannelMetaRenameSuccessEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/rename/embeds";

export class DynamicChannelMetaRenameComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameComponent";
    }

    public static getInstanceType() {
        // TODO: Ensure.
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaRenameBadwordEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaRenameLimitedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaRenameSuccessEmbed )
        ];
    }

    public static getModals() {
        return [ DynamicChannelMetaRenameModal ];
    }

    public static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
