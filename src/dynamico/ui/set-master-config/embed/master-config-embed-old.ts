import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";
import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";

import { UIEmbedTemplate } from "@dynamico/ui/base/ui-embed-template";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

export class MasterConfigEmbedOld extends UIEmbedTemplate {
    public static getName() {
        return "Dynamico/UI/SetMasterConfig/Embeds/MasterConfigEmbed";
    }

    protected getTemplateInputs() {
        const title = "Step 1 - Set dynamic channels name",
            description = "Here you can set a default name for dynamic channels.\n" +
                "You can keep the default settings by pressing the \"Next\" button.\n\n" +
                "**Current default name:**\n" +
                uiUtilsWrapAsTemplate( "textTemplate" );

        return {
            type: "embed",
            color: DYNAMICO_DEFAULT_COLOR_BRAND,
            title,
            description,
        };
    }

    protected getTemplateLogic( interaction: null, args: any ) {
        return {
            masterChannelDefinition: "Master Channel",

            textTemplate: args?.channelNameTemplate || DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
        };
    }
}
