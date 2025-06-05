import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

export class SetupScalingMaxMembersSelect extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingMaxMembersSelect";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        if ( this.uiArgs?.maxMembersPerChannel ) {
            return `👥 Max Members: ${ this.uiArgs.maxMembersPerChannel }`;
        }
        return "👥 Select Max Members Per Channel";
    }

    protected async getMinValues() {
        return 1;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const options: APISelectMenuOption[] = [];
        const currentValue = this.uiArgs?.maxMembersPerChannel;

        // Add options from 2 to 10
        for ( let i = 2; i <= 10; i++ ) {
            options.push( {
                label: `${ i } Members`,
                value: i.toString(),
                emoji: "👥" as any,
                description: `Set maximum of ${ i } members per channel`,
                default: currentValue === i.toString()
            } );
        }

        return options;
    }
}
