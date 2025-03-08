import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";

import { SetupStep2Embed } from "@vertix.gg/bot/src/ui/v3/setup-new/step-2/setup-step-2-embed";

import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";

export class SetupStep2Component extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupStep2Component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [[ChannelButtonsTemplateSelectMenu], [ConfigExtrasSelectMenu]];
    }

    public static getEmbeds() {
        return [SetupStep2Embed];
    }
}
