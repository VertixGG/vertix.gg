import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EventBoardEmbed } from "@vertix.gg/bot/src/ui/general/events/board/event-board-embed";
import { EventJoinVoiceButton } from "@vertix.gg/bot/src/ui/general/events/event-join-voice-button";

/**
 * Dynamic, so every board is drawn by an instance of its own: two servers' events opening in the
 * same sweep must not draw over each other's lists.
 */
export class EventBoardComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/EventBoardComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [ [ EventJoinVoiceButton ] ];
    }

    public static getEmbeds() {
        return [ EventBoardEmbed ];
    }
}
