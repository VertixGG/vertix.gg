import { DynamicChannelMetaLimitSuccessEmbed } from "./embeds/dynamic-channel-meta-limit-success-embed";
import { DynamicChannelMetaLimitInvalidInputEmbed } from "./embeds/dynamic-channel-meta-limit-invalid-input-embed";

import { DynamicChannelMetaLimitModal } from "./dynamic-channel-meta-limit-modal";

import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { SomethingWentWrongEmbed } from "@vertix/ui-v2/_general/something-went-wrong-embed";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

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
