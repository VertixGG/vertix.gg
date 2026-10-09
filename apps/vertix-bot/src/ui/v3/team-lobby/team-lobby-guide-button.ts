import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * The way from a lobby's panel to the page that explains it - who may press what, what each mode
 * does, and how to set hosts - for whoever meets a lobby here first.
 *
 * A link, so discord opens it without the press reaching the bot: it works for everybody who can see
 * the panel, host or not. Dynamic like the panel it sits on - a static entity on a dynamic component
 * fails the checks the bot runs at startup.
 */
export class TeamLobbyGuideButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyGuideButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "How it works";
    }

    protected async getURL(): Promise<string> {
        return "https://voicechannels.online/features/team-lobby";
    }
}
