import { Colors } from "discord.js";

import { UITemplateComponentEmbed } from "@dynamico/ui/base/ui-template-component-embed";

export class NotifyMaxMasterChannels extends UITemplateComponentEmbed {
    public static getName() {
        return "Dynamico/UI/NotifyMaxMasterChannels";
    }

    protected getTitle() {
        return "You have reached your Master Channels limit";
    }

    protected getDescription() {
        return "You can create up to %{maxFreeMasterChannels}% Master Channels in total.";
    }

    protected getColor(): number {
        return Colors.Red;
    }

    protected getFields() {
        return [
            "maxFreeMasterChannels",
        ];
    }

    protected getFieldsLogic( interaction?: null ) {
        return {};
    }
}

export default NotifyMaxMasterChannels;
