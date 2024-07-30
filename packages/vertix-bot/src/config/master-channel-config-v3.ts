import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase  } from "@vertix.gg/base/src/bases/config-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

// TODO: Move to `UI-V3` folder + registration to `ui-module`
export class MasterChannelConfigV3 extends ConfigBase<MasterChannelConfigInterfaceV3> {
    public static getName() {
        return "VertixBase/UI-V2/MasterChannelConfigV3";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannel";
    }

    public getVersion() {
        // UI-V3
        return "0.0.3" as const;
    }

    protected getDefaults(): MasterChannelConfigInterfaceV3["defaults"] {
        const buttonsIdsEmojisMap: MasterChannelConfigInterfaceV3["defaults"]["buttonsIdsEmojisMap"] = {};

        DynamicChannelPrimaryMessageElementsGroup.getAll().forEach( async i => {
            buttonsIdsEmojisMap[ i.getId() ] = await i.getEmoji();
        } );

        return {
            buttonsIdsEmojisMap,

            masterChannelData: {
                dynamicChannelAutoSave: false,

                dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.getAll().map( i => i.getId().toString() ),

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

                dynamicChannelPrimaryMessageTitle: "༄ Manage your Dynamic Channel",
                dynamicChannelPrimaryMessageDescription: "Embrace the responsibility of overseeing your dynamic channel," +
                    "diligently customizing it according to your discerning preferences.\n\n" +
                    "Please be advised that the privilege to make alterations is vested solely of the channel owner.",

                masterChannelMaximumFreeChannels: 6,
                masterChannelName: "➕ New Channel",
            },
        };
    }
}

export default MasterChannelConfigV3;
