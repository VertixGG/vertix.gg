import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EventNeedSubEmbed } from "@vertix.gg/bot/src/ui/general/events/need-sub/event-need-sub-embed";
import { EventJoinVoiceButton } from "@vertix.gg/bot/src/ui/general/events/event-join-voice-button";

export class EventNeedSubComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/EventNeedSubComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [ [ EventJoinVoiceButton ] ];
    }

    public static getEmbeds() {
        return [ EventNeedSubEmbed ];
    }
}
