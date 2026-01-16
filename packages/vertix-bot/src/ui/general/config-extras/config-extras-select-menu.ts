import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UI_CUSTOM_ID_SEPARATOR, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

export class ConfigExtrasSelectMenu extends UIElementStringSelectMenu {
    private static vars = {
        dynamicChannelMentionableLabel: uiUtilsWrapAsTemplate( "dynamicChannelMentionableLabel" ),
        dynamicChannelLogsChannelLabel: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelLabel" ),
        dynamicChannelAutoSaveLabel: uiUtilsWrapAsTemplate( "dynamicChannelAutoSaveLabel" ),
        dynamicChannelControlChannelAutoCreateLabel: uiUtilsWrapAsTemplate( "dynamicChannelControlChannelAutoCreateLabel" ),

        state: uiUtilsWrapAsTemplate( "state" ),
        stateOn: uiUtilsWrapAsTemplate( "stateOn" ),
        stateOff: uiUtilsWrapAsTemplate( "stateOff" )
    };

    public static getName() {
        return "VertixBot/UI-General/ConfigExtrasSelectMenu";
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
            dynamicChannelAutoSaveLabel,
            dynamicChannelControlChannelAutoCreateLabel,

            state
        } = ConfigExtrasSelectMenu.vars;

        // TODO: Do not repeat yourself.
        const result: APISelectMenuOption[] = [
            {
                label: dynamicChannelMentionableLabel + " " + state,
                value:
                    "dynamicChannelMentionable" +
                    UI_CUSTOM_ID_SEPARATOR +
                    ( this.uiArgs?.dynamicChannelMentionable ? "0" : "1" )
            },
            {
                label: dynamicChannelAutoSaveLabel + " " + state,
                value:
                    "dynamicChannelAutoSave" +
                    UI_CUSTOM_ID_SEPARATOR +
                    ( this.uiArgs?.dynamicChannelAutoSave ? "0" : "1" )
            }
        ];

        if ( !this.uiArgs?._configExtraMenuDisableLogsChannelOption ) {
            result.push( {
                label: dynamicChannelLogsChannelLabel + " " + state,
                value: "dynamicChannelLogsChannel" + UI_CUSTOM_ID_SEPARATOR + "0" // Always off, since it only turn off button.
            } );
        }

        if ( this.uiArgs?._configExtraMenuEnableControlChannelAutoCreateOption ) {
            result.push( {
                label: dynamicChannelControlChannelAutoCreateLabel + " " + state,
                value:
                    "dynamicChannelControlChannelAutoCreate" +
                    UI_CUSTOM_ID_SEPARATOR +
                    ( this.uiArgs?.dynamicChannelControlChannelAutoCreate ? "0" : "1" )
            } );
        }

        return result;
    }

    protected getOptions() {
        const { stateOn, stateOff } = ConfigExtrasSelectMenu.vars;

        return {
            state: {
                [ stateOn ]: "∙🟢 On",
                [ stateOff ]: "∙🔴 Off"
            },

            dynamicChannelMentionableLabel: "@ ∙ Mention user in primary message",
            dynamicChannelAutoSaveLabel: "⫸ ∙ Auto save dynamic channel",
            dynamicChannelLogsChannelLabel: "❯❯ ∙ Send logs to custom channel",
            dynamicChannelControlChannelAutoCreateLabel: "▥ ∙ Auto create control panel channel"
        };
    }

    protected getDataFor( option: APISelectMenuOption ) {
        const result: {
            state: typeof ConfigExtrasSelectMenu.vars.stateOn | typeof ConfigExtrasSelectMenu.vars.stateOff;
        } = { state: ConfigExtrasSelectMenu.vars.stateOff };

        const optionValue = option.value.split( UI_CUSTOM_ID_SEPARATOR, 2 );

        if ( "1" === optionValue[ 1 ] ) {
            result.state = ConfigExtrasSelectMenu.vars.stateOn;
        }

        return result;
    }
}
