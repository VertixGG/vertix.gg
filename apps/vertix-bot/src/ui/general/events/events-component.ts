import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EventsEmbed } from "@vertix.gg/bot/src/ui/general/events/events-embed";
import { EventsChannelSelectMenu } from "@vertix.gg/bot/src/ui/general/events/events-channel-select-menu";
import { EventsEnableButton } from "@vertix.gg/bot/src/ui/general/events/events-enable-button";
import { EventsSubPostsButton } from "@vertix.gg/bot/src/ui/general/events/events-sub-posts-button";
import { EventsDashboardButton } from "@vertix.gg/bot/src/ui/general/events/events-dashboard-button";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";

export class EventsComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/EventsComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    /**
     * Drawn as a container because the setup screen is: this takes over that screen's own reply,
     * which was already sent with a flag no later edit can remove.
     */
    public static shouldRenderAsContainer() {
        return true;
    }

    public static getElements() {
        return [
            [ EventsChannelSelectMenu ],
            [ EventsEnableButton, EventsSubPostsButton, EventsDashboardButton, DoneButton ]
        ];
    }

    public static getEmbeds() {
        return [ EventsEmbed ];
    }
}
