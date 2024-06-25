import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import {
    ChannelButtonsTemplateSelectMenu
} from "@vertix.gg/bot/src/ui-v2/channel-buttons-template/channel-buttons-template-select-menu";

import { SetupStep2Embed } from "@vertix.gg/bot/src/ui-v2/setup-new/step-2/setup-step-2-embed";

import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui-v2/config-extras/config-extras-select-menu";

export class SetupStep2Component extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/SetupStep2Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ ChannelButtonsTemplateSelectMenu ],
            [ ConfigExtrasSelectMenu ],
        ];
    }

    public static getEmbeds() {
        return [
            SetupStep2Embed,
        ];
    }
}
