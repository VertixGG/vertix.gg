import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { BotInvite } from "@vertix.gg/bot/src/utils/bot-invite";

export class WelcomeInviteButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/WelcomeInviteButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Invite VoiceChannels";
    }

    protected async getURL(): Promise<string> {
        return BotInvite.$.getUrl( "bot-welcome" );
    }
}
