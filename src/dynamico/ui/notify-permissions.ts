import { UITemplateComponentEmbed } from "@dynamico/ui/base/ui-template-component-embed";

export class NotifyPermissions extends UITemplateComponentEmbed {
    public static getName() {
        return "Dynamico/UI/NotifyPermissions";
    }

    protected getTitle() {
        return "🤷 Oops, bot permissions are insufficient";
    }

    protected getDescription() {
        return "The bot **%{botName}%** should have the following permissions:\n\n" +
            "%{permissions}%\n\n" +
            "Please ensure that **%{botName}%** have the permissions above, and there are no overwrites that effect the bot role.";
    }

    protected getColor() {
        return 0xFF8C00;
    }

    protected getFields() {
        return [
            "botName",
            "permissions",
        ];
    }

    protected getFieldsLogic( interaction?: null, args?: { permissions: string[] } ) {
        if ( ! args ) {
            return {};
        }

        return {
            permissions: args.permissions.map( permission => `• ${ permission }` ).join( "\n" )
        };
    }
}

export default NotifyPermissions;
