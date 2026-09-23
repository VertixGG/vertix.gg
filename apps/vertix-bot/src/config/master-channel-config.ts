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
            // Copied into a generator's own row when it is created, and read from there
            // afterwards - which is also what makes this list the only thing a generator's row is
            // allowed to hold. Changing one reaches the generators made next, and none of the ones
            // already standing: they are carrying the answer they were given.
            dynamicChannelAutoSave: false,

            dynamicChannelAutoStatus: true,

            dynamicChannelDefaultPrivacyState: "public",

            dynamicChannelDefaultUserLimit: null,

            dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.getDefaults().map( ( i ) => i.getId().toString() ),

            dynamicChannelButtonsTemplateByRole: {},

            // Empty means the set has no arrangement of its own and prints in rows of the width
            // the version draws at. Carried here because this list is the whitelist a write to a
            // generator's row is filtered against: absent, `setChannelButtonsRowBreaks()` was
            // dropped on the floor, and the arrangement survived only because the api writes the
            // row itself before telling the bot.
            dynamicChannelButtonsRowBreaks: [],

            dynamicChannelControlChannelId: null,

            // Declared here because this configuration is the whitelist a write to a
            // generator's row is filtered against - `setStrictData()` drops any key it
            // does not find here, silently. Absent, the panel's id could never be stored
            // and every restart would go back to searching for the message.
            dynamicChannelControlMessageId: null,

            // Whitelisted for the same reason as the id above. Absent, the hash would never be
            // stored, and every restart would go on redrawing panels that had not changed.
            dynamicChannelControlMessageHash: null,

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
        };
    }
}

export default MasterChannelConfig;
