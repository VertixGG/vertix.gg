import { Interaction } from "discord.js";

import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";

import { UIEmbed } from "@dynamico/ui/_base/ui-embed";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";
import { guildGetBasicRolesFormatted } from "@dynamico/utils/guild";

export class BasicRoleEmbed extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/BasicRoleEmbed";
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return "Step 3 - Set basic role";
    }

    protected getDescription() {
        return "Here you can set the roles that are defined on your server as verified.\n" +
            "You can keep the current roles by pressing the \"Next\" button.\n\n" +
            "**Current basic roles:**\n" +
            uiUtilsWrapAsTemplate( "basicRoles" );
    }

    protected getArgsFields() {
        return [
            "basicRoles",
        ];
    }

    protected getLogicFields() {
        return [];
    }

    protected async getFieldsLogic( interaction?: Interaction, args?: any ) {
        const guild = interaction?.guild;

        if ( ! guild ) {
            return {};
        }

        return {
            // Get role names by ids.
            basicRoles: await guildGetBasicRolesFormatted( guild, args.basicRoles ),
        };
    }
}
