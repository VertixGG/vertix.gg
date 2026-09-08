import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

export const SETUP_EDIT_BUTTONS_EMBED_VARS = {
    index: uiUtilsWrapAsTemplate( "index" ),
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    roleId: uiUtilsWrapAsTemplate( "roleId" ),

    scopeDisplay: uiUtilsWrapAsTemplate( "scopeDisplay" ),
    scopeDefault: uiUtilsWrapAsTemplate( "scopeDefault" ),
    scopeDefaultVerified: uiUtilsWrapAsTemplate( "scopeDefaultVerified" ),
    verifiedRolesList: uiUtilsWrapAsTemplate( "verifiedRolesList" ),
    scopeRoleOwn: uiUtilsWrapAsTemplate( "scopeRoleOwn" ),
    scopeRoleNew: uiUtilsWrapAsTemplate( "scopeRoleNew" ),
    scopeRoleMissing: uiUtilsWrapAsTemplate( "scopeRoleMissing" ),
    panelNote: uiUtilsWrapAsTemplate( "panelNote" ),

    listHeadingDisplay: uiUtilsWrapAsTemplate( "listHeadingDisplay" ),
    listDefault: uiUtilsWrapAsTemplate( "listDefault" ),
    listRoleOwn: uiUtilsWrapAsTemplate( "listRoleOwn" ),
    listRoleNew: uiUtilsWrapAsTemplate( "listRoleNew" ),

    buttonsList: uiUtilsWrapAsTemplate( "buttonsList" ),
    buttonsNone: uiUtilsWrapAsTemplate( "buttonsNone" ),

    rosterHeading: uiUtilsWrapAsTemplate( "rosterHeading" ),
    rosterButtonsWord: uiUtilsWrapAsTemplate( "rosterButtonsWord" ),
    rosterDisplay: uiUtilsWrapAsTemplate( "rosterDisplay" ),
    rosterNone: uiUtilsWrapAsTemplate( "rosterNone" ),
    rosterOne: uiUtilsWrapAsTemplate( "rosterOne" ),
    rosterMany: uiUtilsWrapAsTemplate( "rosterMany" ),
    rosterList: uiUtilsWrapAsTemplate( "rosterList" ),
    rosterMore: uiUtilsWrapAsTemplate( "rosterMore" ),
    rosterMoreCount: uiUtilsWrapAsTemplate( "rosterMoreCount" ),

    hintDisplay: uiUtilsWrapAsTemplate( "hintDisplay" ),
    hintDefault: uiUtilsWrapAsTemplate( "hintDefault" ),
    hintRoleOwn: uiUtilsWrapAsTemplate( "hintRoleOwn" ),
    hintRoleNew: uiUtilsWrapAsTemplate( "hintRoleNew" ),
    hintEveryone: uiUtilsWrapAsTemplate( "hintEveryone" ),
    hintPushed: uiUtilsWrapAsTemplate( "hintPushed" )
};

export const SETUP_EDIT_VERIFIED_ROLES_EMBED_VARS = {
    separator: "{separator}",
    value: "{value}",
    index: uiUtilsWrapAsTemplate( "index" ),
    verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" )
};

export const SETUP_EDIT_STAFF_ROLES_EMBED_VARS = {
    separator: "{separator}",
    value: "{value}",
    index: uiUtilsWrapAsTemplate( "index" ),
    staffRoles: uiUtilsWrapAsTemplate( "staffRoles" ),
    staffRolesDisplay: uiUtilsWrapAsTemplate( "staffRolesDisplay" ),
    staffRolesNone: uiUtilsWrapAsTemplate( "staffRolesNone" )
};

export const SETUP_EDIT_VOICE_ROLE_EMBED_VARS = {
    index: uiUtilsWrapAsTemplate( "index" ),
    voiceRoleId: uiUtilsWrapAsTemplate( "voiceRoleId" ),
    voiceRoleDisplay: uiUtilsWrapAsTemplate( "voiceRoleDisplay" ),
    voiceRoleGuild: uiUtilsWrapAsTemplate( "voiceRoleGuild" ),
    voiceRoleNone: uiUtilsWrapAsTemplate( "voiceRoleNone" )
};

export const SETUP_EDIT_DEFAULT_PRIVACY_EMBED_VARS = {
    index: uiUtilsWrapAsTemplate( "index" ),
    privacyState: uiUtilsWrapAsTemplate( "privacyState" ),
    privacyPublic: uiUtilsWrapAsTemplate( "privacyPublic" ),
    privacyPrivate: uiUtilsWrapAsTemplate( "privacyPrivate" ),
    privacyHidden: uiUtilsWrapAsTemplate( "privacyHidden" )
};

export const SETUP_EDIT_DEFAULT_USER_LIMIT_EMBED_VARS = {
    index: uiUtilsWrapAsTemplate( "index" ),
    userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
    userLimitDisplay: uiUtilsWrapAsTemplate( "userLimitDisplay" ),
    userLimitInherit: uiUtilsWrapAsTemplate( "userLimitInherit" ),
    userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" ),
    userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" )
};

export const SETUP_EDIT_EMBED_VARS = {
    separator: "{separator}",
    value: "{value}",
    on: uiUtilsWrapAsTemplate( "on" ),
    off: uiUtilsWrapAsTemplate( "off" ),
    index: uiUtilsWrapAsTemplate( "index" ),
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    configUserMention: uiUtilsWrapAsTemplate( "configUserMention" ),
    configUserMentionEnabled: uiUtilsWrapAsTemplate( "configUserMentionEnabled" ),
    configUserMentionDisabled: uiUtilsWrapAsTemplate( "configUserMentionDisabled" ),
    configAutoSave: uiUtilsWrapAsTemplate( "configAutoSave" ),
    configAutoSaveEnabled: uiUtilsWrapAsTemplate( "configAutoSaveEnabled" ),
    configAutoSaveDisabled: uiUtilsWrapAsTemplate( "configAutoSaveDisabled" ),
    configAutoStatus: uiUtilsWrapAsTemplate( "configAutoStatus" ),
    configAutoStatusEnabled: uiUtilsWrapAsTemplate( "configAutoStatusEnabled" ),
    configAutoStatusDisabled: uiUtilsWrapAsTemplate( "configAutoStatusDisabled" ),
    configLogs: uiUtilsWrapAsTemplate( "configLogs" ),
    configLogsEnabled: uiUtilsWrapAsTemplate( "configLogsEnabled" ),
    configLogsDisabled: uiUtilsWrapAsTemplate( "configLogsDisabled" ),
    configControlChannelAutoCreate: uiUtilsWrapAsTemplate( "configControlChannelAutoCreate" ),
    configControlChannelAutoCreateEnabled: uiUtilsWrapAsTemplate( "configControlChannelAutoCreateEnabled" ),
    configControlChannelAutoCreateDisabled: uiUtilsWrapAsTemplate( "configControlChannelAutoCreateDisabled" ),
    dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),
    dynamicChannelLogsChannelId: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelId" ),
    dynamicChannelLogsChannelDefault: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelDefault" ),
    dynamicChannelLogsChannelSelected: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelSelected" ),
    dynamicChannelLogsChannelDisplay: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelDisplay" ),
    dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" ),
    verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    staffRoles: uiUtilsWrapAsTemplate( "staffRoles" ),
    staffRolesDisplay: uiUtilsWrapAsTemplate( "staffRolesDisplay" ),
    staffRolesNone: uiUtilsWrapAsTemplate( "staffRolesNone" ),
    voiceRoleId: uiUtilsWrapAsTemplate( "voiceRoleId" ),
    voiceRoleDisplay: uiUtilsWrapAsTemplate( "voiceRoleDisplay" ),
    voiceRoleGuild: uiUtilsWrapAsTemplate( "voiceRoleGuild" ),
    voiceRoleNone: uiUtilsWrapAsTemplate( "voiceRoleNone" ),
    newChannelPrivacy: uiUtilsWrapAsTemplate( "newChannelPrivacy" ),
    newChannelLimit: uiUtilsWrapAsTemplate( "newChannelLimit" ),

    // Button display labels
    labelDefaultSettings: uiUtilsWrapAsTemplate( "labelDefaultSettings" ),
    labelRoleOverride: uiUtilsWrapAsTemplate( "labelRoleOverride" ),
    labelButtonPrefix: uiUtilsWrapAsTemplate( "labelButtonPrefix" ),
    labelButtonNone: uiUtilsWrapAsTemplate( "labelButtonNone" )
};
