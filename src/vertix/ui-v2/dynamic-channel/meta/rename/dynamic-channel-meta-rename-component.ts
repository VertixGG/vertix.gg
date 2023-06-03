import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

import {
    DynamicChannelMetaRenameModal
} from "@vertix/ui-v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-modal";

import {
    DynamicChannelMetaRenameBadwordEmbed,
    DynamicChannelMetaRenameLimitedEmbed,
    DynamicChannelMetaRenameSuccessEmbed
} from "@vertix/ui-v2/dynamic-channel/meta/rename/embeds";

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
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaRenameSuccessEmbed ),
        ];
    }

    public static getModals() {
        return [
            DynamicChannelMetaRenameModal,
        ];
    }

    protected static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
