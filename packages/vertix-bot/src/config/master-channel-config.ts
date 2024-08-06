import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase  } from "@vertix.gg/base/src/bases/config-base";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelConfig extends ConfigBase<MasterChannelConfigInterface> {
    public static getName() {
        return "VertixBase/UI-V2/MasterChannelConfig";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannel";
    }

    public getVersion() {
        // UI-V2
        return "0.0.2" as const;
    }

    protected getDefaults(): MasterChannelConfigInterface["defaults"] {
        return {
            masterChannelData: {
                dynamicChannelAutoSave: false,

                dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.getAll().map( i => i.getId().toString() ),

                dynamicChannelLogsChannelId: null,

                dynamicChannelMentionable: true,

                dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

                dynamicChannelVerifiedRoles: [],
            },

            masterChannelDefaults: {
                dynamicChannelStateVar: uiUtilsWrapAsTemplate( "state" ),
                dynamicChannelUserVar: uiUtilsWrapAsTemplate( "user" ),
                dynamicChannelsCategoryName: "༄ Dynamic Channels",

                dynamicChannelStatePrivate: "🔴",
                dynamicChannelStatePublic: "🟢",

                masterChannelMaximumFreeChannels: 6,
                masterChannelName: "➕ New Channel",
            },
        };
    }
}

export default MasterChannelConfig;
