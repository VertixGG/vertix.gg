import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/data/src/interfaces/master-channel-config";

// TODO: Move to `UI-V3` folder + registration to `ui-module`
export class MasterChannelConfigV3 extends ConfigBase<MasterChannelConfigInterfaceV3> {
    public static getName() {
        return "VertixBase/UI-V2/MasterChannelConfigV3";
    }

    public getConfigName() {
        return "Vertix/Config/MasterChannel";
    }

    public getVersion() {
        return VERSION_UI_V3;
    }

    protected getDefaults(): MasterChannelConfigInterfaceV3[ "defaults" ] {
        return {
            // Copied into a generator's own row when it is created, and read from there
            // afterwards - which is also what makes this list the only thing a generator's row is
            // allowed to hold. Changing one reaches the generators made next, and none of the ones
            // already standing: they are carrying the answer they were given.
            dynamicChannelAutoSave: false,

            dynamicChannelAutoStatus: true,

            dynamicChannelDefaultPrivacyState: "public",

            dynamicChannelDefaultUserLimit: null,

            dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.getAll().map( ( i ) =>
                i.getId().toString()
            ),

            dynamicChannelButtonsTemplateByRole: {},

            dynamicChannelControlChannelId: null,

            dynamicChannelLogsChannelId: null,

            dynamicChannelMentionable: true,

            dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

            dynamicChannelStaffRoles: [],
            dynamicChannelVerifiedRoles: [],

            dynamicChannelVoiceRoleId: null
        };
    }
}

export default MasterChannelConfigV3;
