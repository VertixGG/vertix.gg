import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { GUILD_EVENTS_JOIN_FALLBACK_URL } from "@vertix.gg/bot/src/definitions/guild-events";

/**
 * The way into an event's voice, on its board and on its "need a sub" post.
 *
 * A link rather than a button the bot answers: pressing it asks the bot nothing, so there is nothing
 * a restart can leave unanswered. Greyed out once there is nothing left to join.
 */
export class EventJoinVoiceButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/EventJoinVoiceButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "🔊  Join voice";
    }

    protected async getURL() {
        return String( this.uiArgs?.joinUrl || GUILD_EVENTS_JOIN_FALLBACK_URL );
    }

    protected async isDisabled() {
        return !! this.uiArgs?.isJoinClosed;
    }
}
