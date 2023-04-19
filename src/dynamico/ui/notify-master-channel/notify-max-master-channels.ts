import { UIEmbed } from "@dynamico/ui/_base/ui-embed";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

export class NotifyMaxMasterChannels extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/NotifyMaxMasterChannels";
    }

    protected getTitle() {
        return "🤷 You have reached your Master Channels limit";
    }

    protected getDescription() {
        return `You can create up to ${ uiUtilsWrapAsTemplate( "maxFreeMasterChannels" ) } Master Channels in total.`;
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getLogicFields() {
        return [
            "maxFreeMasterChannels",
        ];
    }

    protected async getFieldsLogic( interaction?: null ) {
        return {};
    }
}

export default NotifyMaxMasterChannels;
