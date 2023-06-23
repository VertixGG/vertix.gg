import { APISelectMenuOption } from "discord.js";

import { UI_GENERIC_SEPARATOR, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIElementStringSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-string-select-menu";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class ConfigExtrasSelectMenu extends UIElementStringSelectMenu {
    private static vars = {
        dynamicChannelMentionableLabel: uiUtilsWrapAsTemplate( "dynamicChannelMentionableLabel" ),
        dynamicChannelLogsChannelLabel: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelLabel" ),

        state: uiUtilsWrapAsTemplate( "state" ),
        stateOn: uiUtilsWrapAsTemplate( "stateOn" ),
        stateOff: uiUtilsWrapAsTemplate( "stateOff" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ConfigExtrasSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "⌘ ∙ Configuration";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getSelectOptions() {
        const {
            dynamicChannelMentionableLabel,
            dynamicChannelLogsChannelLabel,

            state,
        } = ConfigExtrasSelectMenu.vars;

        return [
            {
                label: dynamicChannelMentionableLabel + " " + state,
                value: "dynamicChannelMentionable" + UI_GENERIC_SEPARATOR + ( this.uiArgs?.dynamicChannelMentionable ? "0" : "1" ),
            },
            {
                label: dynamicChannelLogsChannelLabel + " " + state,
                value: "dynamicChannelLogsChannel" + UI_GENERIC_SEPARATOR + "0",
                selected: ! this.uiArgs?.dynamicChannelLogsChannelId,
            }
        ];
    }

    protected getOptions() {
        const {
            stateOn,
            stateOff,
        } = ConfigExtrasSelectMenu.vars;

        return {
            state: {
                [ stateOn ]: "∙🟢 On",
                [ stateOff ]: "∙🔴 Off",
            },

            dynamicChannelMentionableLabel: "@ ∙ Mention user in primary message",
            dynamicChannelLogsChannelLabel: "✎ ∙ Send logs to custom channel",
        };
    }

    protected getDataFor( option: APISelectMenuOption ) {
        const result = {
                state: ConfigExtrasSelectMenu.vars.stateOff,
            },
            optionValue = option.value.split( UI_GENERIC_SEPARATOR, 2 );

        if ( "1" === optionValue[ 1 ] ) {
            result.state = ConfigExtrasSelectMenu.vars.stateOn;
        }

        return result;
    }
}
