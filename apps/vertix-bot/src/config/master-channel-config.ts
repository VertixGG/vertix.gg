import { DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS } from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";
import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { ConfigBase } from "@vertix.gg/data/src/bases/config-base";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { MasterChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";

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

    protected getDefaults(): MasterChannelConfigInterface[ "defaults" ] {
        return {
            // Read live, by everything, everywhere. Changing one of these changes what every
            // server sees as soon as the bot restarts, because nothing holds a copy of it.
            globals: {
                dynamicChannelsCategoryName: "༄ Dynamic Channels",

                dynamicChannelControlChannelName: "✨・control-panel",

                dynamicChannelStatePrivate: "🔴",
                dynamicChannelStatePublic: "🟢",

                masterChannelName: "➕ New Channel"
            },

            // Copied into a generator's own row when it is created, and read from there afterwards.
            // Changing one of these reaches the generators made next, and none of the ones that
            // already exist - they are carrying the answer they were given.
            settings: {
                dynamicChannelAutoSave: false,

                dynamicChannelAutoStatus: true,

                dynamicChannelDefaultPrivacyState: "public",

                dynamicChannelDefaultUserLimit: null,

                dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.getDefaults().map( ( i ) => i.getId().toString() ),

                dynamicChannelButtonsTemplateByRole: {},

                dynamicChannelControlChannelId: null,

                dynamicChannelLfmChannelIds: [],

                dynamicChannelLfmPingRoleIds: [],

                dynamicChannelLfmPostCooldownMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postCooldown,

                dynamicChannelLfmPingCooldownMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.pingCooldown,

                dynamicChannelLfmPostExpiryMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry,

                dynamicChannelLfmOccupancyDebounceMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.occupancyDebounce,

                dynamicChannelLogsChannelId: null,

                dynamicChannelMentionable: true,

                dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

                dynamicChannelStaffRoles: [],
                dynamicChannelVerifiedRoles: [],

                dynamicChannelVoiceRoleId: null
            }
        };
    }
}

export default MasterChannelConfig;
