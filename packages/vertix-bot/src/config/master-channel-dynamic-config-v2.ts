import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { MasterChannelDynamicConfig } from "@vertix.gg/base/src/interfaces/master-channel-config";

export class MasterChannelDynamicConfigV2 extends ConfigBase<MasterChannelDynamicConfig> {
    public static getName() {
        return "Vertix/Config/MasterChannelDynamicV2";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannelDynamic";
    }

    public getVersion() {
        return VERSION_UI_V2;
    }

    protected getDefaults(): MasterChannelDynamicConfig["defaults"] {
        return {
            // The default values/data structure for a newly created “master” channel will be per MasterChannel.
            settings: {
                type: EMasterChannelType.DYNAMIC,

                dynamicChannelAutoSave: false,

                dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.getAll().map( ( i ) => i.getId().toString() ),

                dynamicChannelLogsChannelId: null,

                dynamicChannelMentionable: true,

                dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

                dynamicChannelVerifiedRoles: []
            },

            // Constants will be used globally for the entire bot.
            constants: {
                dynamicChannelsCategoryName: "༄ Dynamic Channels",

                dynamicChannelStatePrivate: "🔴",
                dynamicChannelStatePublic: "🟢",

                masterChannelMaximumFreeChannels: 6,
                masterChannelName: "➕ New Channel"
            },
        };
    }
}

export default MasterChannelDynamicConfigV2;
