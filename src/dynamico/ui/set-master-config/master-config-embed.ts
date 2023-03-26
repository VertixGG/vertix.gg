import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";
import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";

import { UIEmbed } from "@dynamico/ui/base/ui-embed";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

export class MasterConfigEmbed extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/SetMasterConfig/MasterConfigEmbed";
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return "Step 1 - Set dynamic channels name";
    }

    protected getDescription() {
        return "Here you can set a default name for dynamic channels.\n" +
            "You can keep the default settings by pressing the \"Next\" button.\n\n" +
            "**Current default name:**\n" +
            "`" + uiUtilsWrapAsTemplate( "textTemplate" ) + "`";
    }

    protected getFields() {
        return [
            "masterChannelDefinition",
            "textTemplate",
        ];
    }

    protected async getFieldsLogic( interaction?: null, args?: any ) {
        return {
            masterChannelDefinition: "Master Channel",

            textTemplate: args?.channelNameTemplate || DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
        };
    }
}

export default MasterConfigEmbed;
