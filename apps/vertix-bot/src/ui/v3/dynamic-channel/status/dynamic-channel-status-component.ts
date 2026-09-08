import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { DynamicChannelStatusModal } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/status/dynamic-channel-status-modal";

import {
    DynamicChannelStatusBadwordEmbed,
    DynamicChannelStatusClearedEmbed,
    DynamicChannelStatusSuccessEmbed
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/status/embeds";

export class DynamicChannelStatusComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelStatusComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelStatusBadwordEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelStatusClearedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelStatusSuccessEmbed )
        ];
    }

    public static getModals() {
        return [ DynamicChannelStatusModal ];
    }

    public static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
