import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Turns Events on or off - labelled with what pressing it does.
 *
 * It cannot be pressed on while there is no channel to post in, which is what makes that refusal
 * unnecessary rather than something to explain after the fact.
 */
export class EventsEnableButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/EventsEnableButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return uiUtilsWrapAsTemplate( "displayText" );
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return this.uiArgs?.eventsEnabled ? "secondary" : "success";
    }

    protected async getEmoji() {
        return this.uiArgs?.eventsEnabled ? "⏸️" : "▶️";
    }

    protected async isDisabled() {
        return ! this.uiArgs?.eventsEnabled && ! this.uiArgs?.eventsChannelId;
    }

    protected getOptions() {
        return {
            turnOnText: "Turn on",
            turnOffText: "Turn off"
        };
    }

    protected async getLogic() {
        return {
            displayText: uiUtilsWrapAsTemplate( this.uiArgs?.eventsEnabled ? "turnOffText" : "turnOnText" )
        };
    }
}
