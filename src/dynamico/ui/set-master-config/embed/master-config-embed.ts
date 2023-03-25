import { UIEmbed } from "@dynamico/ui/base/ui-embed";
import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";
import { DATA_DEFAULT_DYNAMICO_BRAND_COLOR } from "@dynamico/constants/data";

export class MasterConfigEmbed extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/SetMasterConfig/Embeds/MasterConfigEmbed";
    }

    protected getColor(): number {
        return DATA_DEFAULT_DYNAMICO_BRAND_COLOR;
    }

    protected getTitle() {
        return "Step 1 - Set dynamic channels name";
    }

    protected getDescription() {
        return "Here you can set a default name for dynamic channels.\n" +
            "You can keep the default settings by pressing the \"Next\" button.\n\n" +
            "**Current default name:**\n" +
            "`%{textTemplate}%`";
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
