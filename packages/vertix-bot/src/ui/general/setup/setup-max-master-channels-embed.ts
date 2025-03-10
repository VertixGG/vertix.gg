import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupMaxMasterChannelsEmbed extends UIEmbedBase {
    public static getName () {
        return "VertixBot/UI-General/SetupMaxMasterChannelsEmbed";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle () {
        return "🤷  You have reached your master channels limit";
    }

    protected getDescription () {
        return `You can create up to **${ uiUtilsWrapAsTemplate( "maxMasterChannels" ) }** Master Channels in total.`;
    }

    protected getLogic ( args: UIArgs ) {
        return {
            maxMasterChannels: args.maxMasterChannels
        };
    }
}
