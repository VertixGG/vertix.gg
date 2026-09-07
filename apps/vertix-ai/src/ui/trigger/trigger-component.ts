import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { TriggerEmbed } from "@vertix.gg/ai/src/ui/trigger/trigger-embed";
import { TriggerEventsMenu } from "@vertix.gg/ai/src/ui/trigger/trigger-events-menu";
import { TriggerChannelsMenu } from "@vertix.gg/ai/src/ui/trigger/trigger-channels-menu";

export class TriggerComponent extends UIComponentBase {
    public static getName() {
        return "VertixAI/UI/TriggerComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ TriggerEventsMenu ],
            [ TriggerChannelsMenu ]
        ];
    }

    public static getEmbeds() {
        return [ TriggerEmbed ];
    }
}
