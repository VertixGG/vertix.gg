import { DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS } from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";
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

            dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.getDefaults().map( ( i ) =>
                i.getId().toString()
            ),

            dynamicChannelButtonsTemplateByRole: {},

            // Empty means the set has no arrangement of its own and prints in rows of the width
            // the version draws at. Carried here because this list is the whitelist a write to a
            // generator's row is filtered against: absent, `setChannelButtonsRowBreaks()` was
            // dropped on the floor, and the arrangement survived only because the api writes the
            // row itself before telling the bot.
            dynamicChannelButtonsRowBreaks: [],

            dynamicChannelControlChannelId: null,

            dynamicChannelLogsChannelId: null,

            // Carried for the same reason the row breaks above are: this configuration is the
            // whitelist a write to a generator's row is filtered against, so a key absent here is
            // a setting that cannot be stored at all. V3 draws the Lfm button, and without these
            // every attempt to point it at a channel was dropped on the floor - leaving a button
            // that could only ever answer that nobody had configured it.
            dynamicChannelLfmChannelIds: [],

            dynamicChannelLfmPingRoleIds: [],

            dynamicChannelLfmPostCooldownMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postCooldown,

            dynamicChannelLfmPingCooldownMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.pingCooldown,

            dynamicChannelLfmPostExpiryMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry,

            dynamicChannelLfmOccupancyDebounceMs: DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.occupancyDebounce,

            dynamicChannelMentionable: true,

            dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "user" ) + "'s Channel",

            dynamicChannelStaffRoles: [],
            dynamicChannelVerifiedRoles: [],

            dynamicChannelVoiceRoleId: null
        };
    }
}

export default MasterChannelConfigV3;
