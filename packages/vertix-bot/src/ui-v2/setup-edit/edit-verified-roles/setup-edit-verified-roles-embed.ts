import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { VerifiedRolesEmbed } from "@vertix.gg/bot/src/ui-v2/verified-roles/verified-roles-embed";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class SetupEditVerifiedRolesEmbed extends VerifiedRolesEmbed {
    private static vars = {
        index: uiUtilsWrapAsTemplate( "index" )
    };

    public static getName() {
        return "VertixBot/UI-V2/SetupEditVerifiedRolesEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return `🛡️  Edit Verified Roles Of Master Channel #${ SetupEditVerifiedRolesEmbed.vars.index }`;
    }

    protected getDescription() {
        const index = SetupEditVerifiedRolesEmbed.vars.index;

        return `Editing verified roles will impact the dynamic channels created by Master Channel #${ index }.\n\n` +

            "**_Current Verified Roles_**\n\n" +
            "> " + super.getDescription();
    }

    protected getFooter() {
        return "Note: The changes will only affect dynamic channels that change their state after the editing, the old roles in the channel will be be unchanged.";
    }

    protected getLogic( args: UIArgs ) {
        return {
            ... super.getLogic( args ),

            index: args.index + 1,
        };
    }
}
