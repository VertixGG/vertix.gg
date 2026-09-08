import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelMetaStatusModal } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/status/dynamic-channel-meta-status-modal";

import {
    DynamicChannelMetaStatusBadwordEmbed,
    DynamicChannelMetaStatusClearedEmbed,
    DynamicChannelMetaStatusSuccessEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/status/embeds";

export class DynamicChannelMetaStatusComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelMetaStatusComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaStatusBadwordEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaStatusClearedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaStatusSuccessEmbed )
        ];
    }

    public static getModals() {
        return [ DynamicChannelMetaStatusModal ];
    }

    public static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
