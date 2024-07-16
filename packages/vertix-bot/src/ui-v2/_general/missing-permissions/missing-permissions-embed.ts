import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class MissingPermissionsEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        omitterDisplayName: uiUtilsWrapAsTemplate( "omitterDisplayName" ),
        missingPermissions: uiUtilsWrapAsTemplate( "missingPermissions" ),
    };

    public static getName() {
        return "Vertix/UI-V2/MissingPermissionsEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "🔐  Oops! Certain permissions are required";
    }

    protected getDescription() {
        const {
            omitterDisplayName,
            missingPermissions,
        }  = MissingPermissionsEmbed.vars;

        return `Some permissions are required to proceed, **${ omitterDisplayName }** is missing the following permissions:\n\n` +
            missingPermissions;
    }

    protected getColor() {
        return 0xE2AD2D; // As emoji.
    }

    protected getArrayOptions() {
        const { separator, value } = MissingPermissionsEmbed.vars;

        return {
            missingPermissions: {
                format: `- ${ value }${ separator }`,
                separator: "\n",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        return {
            omitterDisplayName: args.omitterDisplayName,
            missingPermissions: args.missingPermissions.map( ( permission: string ) => permission.split(/(?=[A-Z])/).join(" ") ),
        };
    }
}
