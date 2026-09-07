import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    ALL_TRIGGER_EVENTS,
    TRIGGER_EVENT_DEFINITIONS
} from "@vertix.gg/ai/src/definitions/trigger-event-definitions";

export class TriggerEventsMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixAI/UI/TriggerEventsMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "Events the AI acts on";
    }

    /** Zero is a real choice - it is how a server switches the AI off. */
    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return ALL_TRIGGER_EVENTS.length;
    }

    protected async getSelectOptions() {
        const enabled = this.getEnabledEvents();

        return ALL_TRIGGER_EVENTS.map( ( event ) => {
            const definition = TRIGGER_EVENT_DEFINITIONS[ event ];

            return {
                label: definition.label,
                description: definition.description,
                value: event,
                emoji: { name: definition.emoji },
                default: enabled.includes( event )
            };
        } );
    }

    private getEnabledEvents(): string[] {
        const events = this.uiArgs?.enabledEvents;

        return Array.isArray( events ) ? events.filter( ( event ): event is string => "string" === typeof event ) : [];
    }
}
