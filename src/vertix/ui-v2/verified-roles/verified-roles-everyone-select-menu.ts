import { APISelectMenuOption } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UI_GENERIC_SEPARATOR, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIElementStringSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-string-select-menu";

export class VerifiedRolesEveryoneSelectMenu extends UIElementStringSelectMenu {
    private static vars = {
        dynamicChannelIncludeEveryoneRoleLabel: uiUtilsWrapAsTemplate( "dynamicChannelIncludeEveryoneRoleLabel" ),

        state: uiUtilsWrapAsTemplate( "state" ),
        stateOn: uiUtilsWrapAsTemplate( "stateOn" ),
        stateOff: uiUtilsWrapAsTemplate( "stateOff" ),
    };

    public static getName() {
        return "Vertix/UI-V2/VerifiedRolesEveryoneSelectMenu";
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
            value: "dynamicChannelIncludeEveryoneRole" + UI_GENERIC_SEPARATOR + ( this.uiArgs?.dynamicChannelIncludeEveryoneRole ? "0" : "1" ),
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
            optionValue = option.value.split( UI_GENERIC_SEPARATOR, 2 );

        if ( "1" === optionValue[ 1 ] ) {
            result.state = VerifiedRolesEveryoneSelectMenu.vars.stateOn;
        }

        return result;
    }
}
