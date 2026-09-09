import "@vertix.gg/prisma/bot-client";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export const MAX_EDIT_MASTER_BUTTONS_PER_ROW = 2;

export interface ISetupArgs extends UIArgs {
    /**
     * The generator channels, each carrying the discord limit its dynamic channels copy when they
     * have no default of their own - only discord knows it, and the row does not.
     */
    masterChannels?: ( PrismaBot.Channel & { userLimit?: number } )[];
    badwords?: string[];
    voiceRoleId?: string | null;
    verifiedRoleIds?: string[];
    staffRoleIds?: string[];
    /** Also the `@everyone` role id, which is how a generator that narrowed nothing is spotted. */
    guildId?: string;
    maxMasterChannels?: number;
    scalingEditMasterChannelId?: string;
    scalingPrefix?: string;
    scalingMaxMembers?: number;
    scalingMasterChannelIndex?: string | number;
}

export const SETUP_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    masterChannels: uiUtilsWrapAsTemplate( "masterChannels" ),
    masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
    masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" ),
    masterChannelsOptions: {
        index: uiUtilsWrapAsTemplate( "index" ),
        name: uiUtilsWrapAsTemplate( "name" ),
        id: uiUtilsWrapAsTemplate( "id" ),
        channelsTemplateName: uiUtilsWrapAsTemplate( "channelsTemplateName" ),
        channelsTemplateButtons: uiUtilsWrapAsTemplate( "channelsTemplateButtons" ),
        channelsVerifiedRoles: uiUtilsWrapAsTemplate( "channelsVerifiedRoles" ),
        channelsLogsChannelId: uiUtilsWrapAsTemplate( "channelsLogsChannelId" ),
        channelsAutoSave: uiUtilsWrapAsTemplate( "channelsAutoSave" ),
        scalingPrefix: uiUtilsWrapAsTemplate( "scalingPrefix" ),
        scalingMaxMembers: uiUtilsWrapAsTemplate( "scalingMaxMembers" ),
        version: uiUtilsWrapAsTemplate( "version" )
    },
    badwords: uiUtilsWrapAsTemplate( "badwords" ),
    badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
    badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" ),
    voiceRoleId: uiUtilsWrapAsTemplate( "voiceRoleId" ),
    voiceRoleMessage: uiUtilsWrapAsTemplate( "voiceRoleMessage" ),
    voiceRoleMessageDefault: uiUtilsWrapAsTemplate( "voiceRoleMessageDefault" ),
    verifiedRoleIds: uiUtilsWrapAsTemplate( "verifiedRoleIds" ),
    verifiedRolesMessage: uiUtilsWrapAsTemplate( "verifiedRolesMessage" ),
    verifiedRolesMessageDefault: uiUtilsWrapAsTemplate( "verifiedRolesMessageDefault" ),
    staffRoleIds: uiUtilsWrapAsTemplate( "staffRoleIds" ),
    staffRolesMessage: uiUtilsWrapAsTemplate( "staffRolesMessage" ),
    staffRolesMessageDefault: uiUtilsWrapAsTemplate( "staffRolesMessageDefault" ),
    none: uiUtilsWrapAsTemplate( "none" ),
    inherited: uiUtilsWrapAsTemplate( "inherited" ),

    // Master channel display labels
    labelName: uiUtilsWrapAsTemplate( "labelName" ),
    labelChannelId: uiUtilsWrapAsTemplate( "labelChannelId" ),
    labelDynamicChannelsName: uiUtilsWrapAsTemplate( "labelDynamicChannelsName" ),
    labelButtons: uiUtilsWrapAsTemplate( "labelButtons" ),
    labelVerifiedRoles: uiUtilsWrapAsTemplate( "labelVerifiedRoles" ),
    labelStaffRoles: uiUtilsWrapAsTemplate( "labelStaffRoles" ),
    labelVoiceRole: uiUtilsWrapAsTemplate( "labelVoiceRole" ),
    labelNewChannelPrivacy: uiUtilsWrapAsTemplate( "labelNewChannelPrivacy" ),
    labelNewChannelLimit: uiUtilsWrapAsTemplate( "labelNewChannelLimit" ),
    labelLogsChannel: uiUtilsWrapAsTemplate( "labelLogsChannel" ),
    labelAutoSave: uiUtilsWrapAsTemplate( "labelAutoSave" ),
    labelVersion: uiUtilsWrapAsTemplate( "labelVersion" ),
    labelScalingPrefix: uiUtilsWrapAsTemplate( "labelScalingPrefix" ),
    labelMaxMembers: uiUtilsWrapAsTemplate( "labelMaxMembers" )
};
