import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelNameTemplateEditButton } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-edit-button";
import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";

import { SetupStep1Embed } from "@vertix.gg/bot/src/ui/v2/setup-new/step-1/setup-step-1-embed";

export class SetupStep1Component extends UIComponentBase {
    public static getName () {
        return "Vertix/UI-V2/SetupStep1Component";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements () {
        return [ [ ChannelNameTemplateEditButton ] ];
    }

    public static getEmbeds () {
        return [ SetupStep1Embed ];
    }

    public static getModals () {
        return [ ChannelNameTemplateModal ];
    }
}
