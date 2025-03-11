import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

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
        return VERSION_UI_V2;
    }

    protected getDefaults(): MasterChannelConfigInterface["defaults"] {
        return {
            // Constants will be used globally for the entire bot.
            constants: {
                dynamicChannelStateVar: uiUtilsWrapAsTemplate( "state" ),
                dynamicChannelUserVar: uiUtilsWrapAsTemplate( "user" ),
                dynamicChannelsCategoryName: "༄ Dynamic Channels",

                dynamicChannelStatePrivate: "🔴",
                dynamicChannelStatePublic: "🟢",

                masterChannelMaximumFreeChannels: 6,
                masterChannelName: "➕ New Channel"
            },

            // The default values/data structure for a newly created “master” channel will be per MasterChannel.
            settings: {
                dynamicChannelAutoSave: false,

                dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.getAll().map( ( i ) => i.getId().toString() ),

                dynamicChannelLogsChannelId: null,

                dynamicChannelMentionable: true,

                dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

                dynamicChannelVerifiedRoles: []
            }
        };
    }
}

export default MasterChannelConfig;
