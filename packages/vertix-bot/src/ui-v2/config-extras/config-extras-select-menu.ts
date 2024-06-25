
import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UI_GENERIC_SEPARATOR, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIElementStringSelectMenu } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-string-select-menu";

import type { APISelectMenuOption } from "discord.js";

export class ConfigExtrasSelectMenu extends UIElementStringSelectMenu {
    private static vars = {
        dynamicChannelMentionableLabel: uiUtilsWrapAsTemplate( "dynamicChannelMentionableLabel" ),
        dynamicChannelLogsChannelLabel: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelLabel" ),
        dynamicChannelAutoSaveLabel: uiUtilsWrapAsTemplate( "dynamicChannelAutoSaveLabel" ),

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
            dynamicChannelAutoSaveLabel,

            state,
        } = ConfigExtrasSelectMenu.vars;

        // TODO: Do not repeat yourself.
        const result: APISelectMenuOption[] = [
            {
                label: dynamicChannelMentionableLabel + " " + state,
                value: "dynamicChannelMentionable" + UI_GENERIC_SEPARATOR + ( this.uiArgs?.dynamicChannelMentionable ? "0" : "1" ),
            },
            {
                label: dynamicChannelAutoSaveLabel + " " + state,
                value: "dynamicChannelAutoSave" + UI_GENERIC_SEPARATOR + ( this.uiArgs?.dynamicChannelAutoSave ? "0" : "1" ),
            }
        ];

        if ( ! this.uiArgs?._configExtraMenuDisableLogsChannelOption ) {
            result.push(
                {
                    label: dynamicChannelLogsChannelLabel + " " + state,
                    value: "dynamicChannelLogsChannel" + UI_GENERIC_SEPARATOR + "0", // Always off, since it only turn off button.
                }
            );
        }

        return result;
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
            dynamicChannelAutoSaveLabel: "⫸ ∙ Auto save dynamic channel",
            dynamicChannelLogsChannelLabel: "❯❯ ∙ Send logs to custom channel",
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
