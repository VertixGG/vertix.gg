import { Channel } from ".prisma/client";

import { UIElementStringSelectMenu } from "@vertix/ui-v2/_base/elements/ui-element-string-select-menu";

import { UI_GENERIC_SEPARATOR, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class ConfigSelectMasterMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "Vertix/UI-V2/ConfigSelectMasterMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getSelectOptions() {
        // Return all master channels.
        let index = 0;
        return this.uiArgs?.masterChannels?.map( ( channel: Channel ) => {
            return {
                label: uiUtilsWrapAsTemplate( "masterChannel" ) + ++index,
                value: index.toString() + UI_GENERIC_SEPARATOR + channel.id,
            };
        } ) || [];
    }

    protected getOptions() {
        return {
            masterChannel: "Master Channel #",
        };
    }
}
