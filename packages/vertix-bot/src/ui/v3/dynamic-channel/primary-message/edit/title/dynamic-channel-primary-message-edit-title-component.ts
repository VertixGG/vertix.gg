import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrimaryMessageEditTitleButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-button";

import { DynamicChannelPrimaryMessageEditTitleModal } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-modal";

import { DynamicChannelPrimaryMessageEditTitleEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-embed";

export class DynamicChannelPrimaryMessageEditTitleComponent extends UIComponentBase {
    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements () {
        return [ [ DynamicChannelPrimaryMessageEditTitleButton ] ];
    }

    public static getEmbeds () {
        return [ DynamicChannelPrimaryMessageEditTitleEmbed ];
    }

    public static getModals () {
        return [ DynamicChannelPrimaryMessageEditTitleModal ];
    }
}
