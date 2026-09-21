import "@vertix.gg/prisma/bot-client";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import type {
    GuildTimingsInterface,
    TGuildTimingsOverrides
} from "@vertix.gg/definitions/src/guild-timings-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export const MAX_EDIT_MASTER_BUTTONS_PER_ROW = 2;

// How long one tip holds the footer before the next takes it. Read from the environment because a
// screen is only reachable for as long as its interaction token lives, and that window is discord's
// rather than ours - a deployment that wants the tips to turn over faster should not need a build.
export const SETUP_TIP_TIMEOUT = Number( process.env.SETUP_TIP_TIMEOUT ) || 300000; // 5 minutes.

/**
 * The step whose screen draws a tip - the setup screen itself, which is the only one with a footer
 * for one. Spelled out because it is the execution step's own name, the same way every other
 * entity name in this file is.
 */
export const SETUP_TIPS_STEP = "default";

/**
 * The tips the setup screen cycles its footer through, each holding it for its own `timeout`.
 *
 * `id` is what the tip is filed under - the var naming it, and the key its text sits under in every
 * language file. Spelled rather than positional, so a tip added in the middle cannot silently hand
 * its text to the one below it, which is how a select menu's options once relabelled themselves.
 */
export const SETUP_TIPS = [
    {
        id: "logs-channel",
        text: "💡 You can set logs channel by editing the master channel.",
        timeout: SETUP_TIP_TIMEOUT
    },
    {
        id: "badwords",
        text: "💡 Badwords are set once for the server and limit every dynamic channel name.",
        timeout: SETUP_TIP_TIMEOUT
    },
    {
        id: "inherited-roles",
        text: "💡 A generator reads *(from the server options)* until you give it roles of its own.",
        timeout: SETUP_TIP_TIMEOUT
    },
    {
        id: "templates",
        text: "💡 Members can save a channel's name, limit and privacy as a template and reuse it later.",
        timeout: SETUP_TIP_TIMEOUT
    },
    {
        id: "autosave",
        text: "💡 With auto save on, a member's next channel opens the way they left their last one.",
        timeout: SETUP_TIP_TIMEOUT
    },
    {
        id: "lfm-pings",
        text: "💡 A looking-for-more post only mentions the roles you allow — choose none and it never pings.",
        timeout: SETUP_TIP_TIMEOUT
    },
    {
        id: "privacy-default",
        text: "💡 Pick what a new channel starts as: public, private or hidden.",
        timeout: SETUP_TIP_TIMEOUT
    }
];

/**
 * The var naming each tip, by the tip's id - which is what the option map answers with the text in
 * the reader's own language.
 *
 * Kept as its own map so a lookup by id is typed; reaching into the whole vars object for a name
 * built at runtime is not.
 */
export const SETUP_TIP_VARS: Record<string, string> = SETUP_TIPS.reduce( ( acc, tip ) => {
    acc[ tip.id ] = uiUtilsWrapAsTemplate( `tip-${ tip.id }` );

    return acc;
}, {} as Record<string, string> );

/**
 * The same vars under the names they are spelled as, for the embed's own var list.
 *
 * Filed under `tip-<id>` rather than the bare id because that list is one flat namespace shared
 * with every other var the screen has: a tip called `badwords` spread in under its own id silently
 * replaced the `badwords` var, and the badwords line went looking for a tip.
 */
const SETUP_TIP_EMBED_VARS: Record<string, string> = SETUP_TIPS.reduce( ( acc, tip ) => {
    acc[ `tip-${ tip.id }` ] = SETUP_TIP_VARS[ tip.id ];

    return acc;
}, {} as Record<string, string> );

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
    /**
     * What the screen prints, already worded - `Unlimited` is not a number and the top tier has no
     * ceiling, so this is the formatted allowance rather than the allowance.
     */
    maxMasterChannels?: string;
    scalingPrefix?: string;
    scalingMaxMembers?: number;
    scalingMasterChannelIndex?: string | number;
    /** In milliseconds, as the setting is stored - the timings screen is what turns them into seconds. */
    timingsOverrides?: TGuildTimingsOverrides;
    /** In milliseconds - what the guild runs on now, its own choices over the environment defaults. */
    timingsEffective?: GuildTimingsInterface;
    /**
     * Which tip the footer is holding, counted rather than bounded - the embed takes it modulo the
     * pool, so a screen left open long enough wraps round instead of running off the end.
     */
    tipIndex?: number;
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
    privacyPublic: uiUtilsWrapAsTemplate( "privacyPublic" ),
    privacyPrivate: uiUtilsWrapAsTemplate( "privacyPrivate" ),
    privacyHidden: uiUtilsWrapAsTemplate( "privacyHidden" ),
    autoSaveOn: uiUtilsWrapAsTemplate( "autoSaveOn" ),
    autoSaveOff: uiUtilsWrapAsTemplate( "autoSaveOff" ),

    tipMessage: uiUtilsWrapAsTemplate( "tipMessage" ),

    ... SETUP_TIP_EMBED_VARS,

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
    labelMaxMembers: uiUtilsWrapAsTemplate( "labelMaxMembers" ),
    labelNotCovered: uiUtilsWrapAsTemplate( "labelNotCovered" )
};
