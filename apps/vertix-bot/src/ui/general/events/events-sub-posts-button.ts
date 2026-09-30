import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Switches the "need a sub" posts on or off - labelled with what pressing it does.
 */
export class EventsSubPostsButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/EventsSubPostsButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return uiUtilsWrapAsTemplate( "displayText" );
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getEmoji() {
        return "🙋";
    }

    protected getOptions() {
        return {
            subPostsOffText: "Stop sub posts",
            subPostsOnText: "Post for subs"
        };
    }

    protected async getLogic() {
        return {
            displayText: uiUtilsWrapAsTemplate( false === this.uiArgs?.eventsSubPostsEnabled ? "subPostsOnText" : "subPostsOffText" )
        };
    }
}
