import { DynamicChannelMetaLimitSuccessEmbed } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/embeds/dynamic-channel-meta-limit-success-embed";
import { DynamicChannelMetaLimitInvalidInputEmbed } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/embeds/dynamic-channel-meta-limit-invalid-input-embed";

import { DynamicChannelMetaLimitModal } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/limit/dynamic-channel-meta-limit-modal";

import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui-v2/_general/something-went-wrong-embed";
import { UIEmbedsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embeds-group-base";

export class DynamicChannelMetaLimitComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaLimitSuccessEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaLimitInvalidInputEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        ];
    }

    public static getModals() {
        return [
            DynamicChannelMetaLimitModal
        ];
    }

    protected static getDefaultEmbedsGroup() {
        // By default, its handles only the modal.
        return null;
    }
}
