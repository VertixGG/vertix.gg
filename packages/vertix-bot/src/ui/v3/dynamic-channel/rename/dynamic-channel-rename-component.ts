import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import {
    DynamicChannelRenameModal
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-modal";

import {
    DynamicChannelRenameBadwordEmbed,
    DynamicChannelRenameLimitedEmbed,
    DynamicChannelRenameSuccessEmbed
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/embeds";

export class DynamicChannelRenameComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelRenameComponent";
    }

    public static getInstanceType() {
        // TODO: Ensure.
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelRenameBadwordEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelRenameLimitedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelRenameSuccessEmbed ),
        ];
    }

    public static getModals() {
        return [
            DynamicChannelRenameModal,
        ];
    }

    public static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
