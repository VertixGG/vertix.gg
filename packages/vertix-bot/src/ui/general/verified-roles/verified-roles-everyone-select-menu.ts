import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UI_CUSTOM_ID_SEPARATOR, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

export class VerifiedRolesEveryoneSelectMenu extends UIElementStringSelectMenu {
    private static vars = {
        dynamicChannelIncludeEveryoneRoleLabel: uiUtilsWrapAsTemplate( "dynamicChannelIncludeEveryoneRoleLabel" ),

        state: uiUtilsWrapAsTemplate( "state" ),
        stateOn: uiUtilsWrapAsTemplate( "stateOn" ),
        stateOff: uiUtilsWrapAsTemplate( "stateOff" ),
    };

    public static getName() {
        return "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🛡️ ∙ Everyone role";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getSelectOptions() {
        const {
            dynamicChannelIncludeEveryoneRoleLabel,

            state,
        } = VerifiedRolesEveryoneSelectMenu.vars;

        return [ {
            label: dynamicChannelIncludeEveryoneRoleLabel + " " + state,
            value: "dynamicChannelIncludeEveryoneRole" + UI_CUSTOM_ID_SEPARATOR + ( this.uiArgs?.dynamicChannelIncludeEveryoneRole ? "0" : "1" ),
            emoji: "🛡️" as any,
        } ];
    }

    protected getOptions() {
        const {
            stateOn,
            stateOff,
        } = VerifiedRolesEveryoneSelectMenu.vars;

        return {
            state: {
                [ stateOn ]: "∙🟢 On",
                [ stateOff ]: "∙🔴 Off",
            },

            dynamicChannelIncludeEveryoneRoleLabel: "Include everyone role",
        };
    }

    protected getDataFor( option: APISelectMenuOption ) {
        const result = {
                state: VerifiedRolesEveryoneSelectMenu.vars.stateOff,
            },
            optionValue = option.value.split( UI_CUSTOM_ID_SEPARATOR, 2 );

        if ( "1" === optionValue[ 1 ] ) {
            result.state = VerifiedRolesEveryoneSelectMenu.vars.stateOn;
        }

        return result;
    }
}
