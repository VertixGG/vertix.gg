import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class SetupMaxMasterChannelsEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V2/SetupMaxMasterChannelsEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "🤷  You have reached your master channels limit";
    }

    protected getDescription() {
        return `You can create up to **${ uiUtilsWrapAsTemplate( "maxMasterChannels" ) }** Master Channels in total.`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            maxMasterChannels: args.maxMasterChannels,
        };
    }
}
