import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import { EMasterChannelType } from "@vertix.gg/base/src/definitions/master-channel";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { MasterChannelDynamicConfigV3 as MasterChannelDynamicConfigV3Interface } from "@vertix.gg/base/src/interfaces/master-channel-config";

// TODO: Move to `UI-V3` folder + registration to `ui-module`
export class MasterChannelDynamicConfigV3 extends ConfigBase<MasterChannelDynamicConfigV3Interface> {
    public static getName() {
        return "Vertix/Config/MasterChannelDynamicV3";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannelDynamic";
    }

    public getVersion() {
        return VERSION_UI_V3;
    }

    protected getDefaults(): MasterChannelDynamicConfigV3Interface["defaults"] {
        return {
            settings: {
                type: EMasterChannelType.DYNAMIC,

                dynamicChannelAutoSave: false,

                dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.getAll().map( ( i ) =>
                    i.getId().toString()
                ),

                dynamicChannelLogsChannelId: null,

                dynamicChannelMentionable: true,

                dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

                dynamicChannelVerifiedRoles: [],
            },

            constants: {
                dynamicChannelsCategoryName: "༄ Dynamic Channels",

                dynamicChannelStatePrivate: "🔴",
                dynamicChannelStatePublic: "🟢",

                dynamicChannelPrimaryMessageTitle: "༄ Manage your Dynamic Channel",
                dynamicChannelPrimaryMessageDescription:
                    "Embrace the responsibility of overseeing your dynamic channel," +
                    "diligently customizing it according to your discerning preferences.\n\n" +
                    "Please be advised that the privilege to make alterations is vested solely of the channel owner.",

                masterChannelMaximumFreeChannels: 6,
                masterChannelName: "➕ New Channel"
            }
        };
    }
}

export default MasterChannelDynamicConfigV3;
