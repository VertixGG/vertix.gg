import { Colors } from "discord.js";

import { UITemplateComponentEmbed } from "@dynamico/ui/base/ui-template-component-embed";

export class NotifySetupSuccess extends UITemplateComponentEmbed {
    public static getName() {
        return "Dynamico/UI/NotifySetupSuccess";
    }

    protected getTitle() {
        return "Dynamico has been set up successfully !";
    }

    protected getDescription() {
        return "**Category**: %{masterCategoryName}%\n" +
            "**Create Channel**: <#%{masterChannelId}%>\n";
    }

    protected getColor(): number {
        return Colors.Blue;
    }

    protected getFields() {
        return [
            "masterCategoryName",
            "masterChannelId",
        ];
    }

    protected getFieldsLogic( interaction?: null ) {
        return {};
    }
}

export default NotifySetupSuccess;
