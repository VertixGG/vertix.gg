    import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrimaryMessageEditDescriptionModal } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-modal";

import { DynamicChannelPrimaryMessageEditDescriptionEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-button";
import { DynamicChannelPrimaryMessageEditDescriptionEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-embed";

export class DynamicChannelPrimaryMessageEditDescriptionComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ DynamicChannelPrimaryMessageEditDescriptionEditButton ],
        ];
    }

    public static getEmbeds() {
        return [
            DynamicChannelPrimaryMessageEditDescriptionEmbed,
        ];
    }

    public static getModals() {
        return [
            DynamicChannelPrimaryMessageEditDescriptionModal,
        ];
    }
}
