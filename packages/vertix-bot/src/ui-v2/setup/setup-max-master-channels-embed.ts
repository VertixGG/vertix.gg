import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

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
