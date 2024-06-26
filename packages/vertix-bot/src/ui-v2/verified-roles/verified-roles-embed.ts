import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class VerifiedRolesEmbed extends UIEmbedBase {
    private static _vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
        verifiedRolesDisplay: uiUtilsWrapAsTemplate( "verifiedRolesDisplay" ),
        verifiedRolesEmpty: uiUtilsWrapAsTemplate( "verifiedRolesDefault" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/VerifiedRolesEmbed";
    }

    protected getDescription(): string {
        return VerifiedRolesEmbed._vars.verifiedRolesDisplay;
    }

    protected getOptions() {
        const {
            verifiedRoles,
            verifiedRolesEmpty,
        } = VerifiedRolesEmbed._vars;

        return {
            verifiedRolesDisplay: {
                [ verifiedRoles ]: verifiedRoles,
                [ verifiedRolesEmpty ]: "**None**",
            }
        };
    }

    protected getArrayOptions() {
        return {
            verifiedRoles: {
                format: `<@&${ VerifiedRolesEmbed._vars.value}>${ VerifiedRolesEmbed._vars.separator }`,
                separator: ", "
            }
        };
    }

    protected getLogic( args?: UIArgs ) {
        const result: any = {};

        if ( args?.dynamicChannelVerifiedRoles?.length ) {
            result.verifiedRoles = args.dynamicChannelVerifiedRoles;
            result.verifiedRolesDisplay = VerifiedRolesEmbed._vars.verifiedRoles;
        } else {
            result.verifiedRolesDisplay = VerifiedRolesEmbed._vars.verifiedRolesEmpty;
        }

        return result;
    }
}
