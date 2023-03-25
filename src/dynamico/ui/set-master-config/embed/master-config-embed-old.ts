import UIEmbedTemplate from "@dynamico/ui/base/ui-embed-template";

import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";
import { DATA_DEFAULT_DYNAMICO_BRAND_COLOR } from "@dynamico/constants/data";

export class MasterConfigEmbedOld extends UIEmbedTemplate { // TODO: Extend UITemplateElement
    public static getName() {
        return "Dynamico/UI/SetMasterConfig/Embeds/MasterConfigEmbed";
    }

    protected getTemplateInputs() {
        const title = "Step 1 - Set dynamic channels name",
            description = "Here you can set a default name for dynamic channels.\n" +
                "You can keep the default settings by pressing the \"Next\" button.\n\n" +
                "**Current default name:**\n" +
                "`%{textTemplate}%`";

        return {
            type: "embed",
            color: DATA_DEFAULT_DYNAMICO_BRAND_COLOR,
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
