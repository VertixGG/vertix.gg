import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

import { UIEmbed } from "@dynamico/ui/_base/ui-embed";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

export class NotifyPermissions extends UIEmbed {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/NotifyPermissions";
    }

    public constructor() {
        super();

        this.vars = {
            botName: uiUtilsWrapAsTemplate( "botName" ),
            permissions: uiUtilsWrapAsTemplate( "permissions" ),
        };
    }

    protected getTitle() {
        return "🤷 Oops, bot permissions are insufficient";
    }

    protected getDescription() {
        return `The bot **${ this.vars.botName }** should have the following permissions:\n\n` +
            `${ this.vars.permissions }\n\n` +
            `Please ensure that **${ this.vars.botName }** have the permissions above, and there are no overwrites that effect the bot role.`;
    }

    protected getColor() {
        return DYNAMICO_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getLogicFields() {
        return [
            "botName",
            "permissions",
        ];
    }

    protected async getFieldsLogic( interaction?: null, args?: { permissions: string[] } ) {
        if ( ! args ) {
            return {};
        }

        return {
            permissions: args.permissions.map( permission => `• ${ permission }` ).join( "\n" )
        };
    }
}

export default NotifyPermissions;
