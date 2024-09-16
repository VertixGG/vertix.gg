import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import { DynamicChannelLimitSuccessEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/embeds/dynamic-channel-limit-success-embed";
import { DynamicChannelLimitInvalidInputEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/embeds/dynamic-channel-limit-invalid-input-embed";

import { DynamicChannelLimitModal } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-modal";

export class DynamicChannelLimitComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelLimitComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelLimitSuccessEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelLimitInvalidInputEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        ];
    }

    public static getModals() {
        return [
            DynamicChannelLimitModal
        ];
    }

    public static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
