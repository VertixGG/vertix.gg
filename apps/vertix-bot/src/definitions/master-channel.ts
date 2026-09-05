// TODO: Maybe Rename file to permissions.ts
import { OverwriteType, PermissionsBitField } from "discord.js";

const { Flags } = PermissionsBitField;

/* Default Permissions */

export const DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS = new PermissionsBitField( [
    Flags.Connect,
    Flags.ManageChannels,
    Flags.ManageMessages,
    Flags.ManageRoles,
    Flags.MoveMembers,
    Flags.ReadMessageHistory,
    Flags.SendMessages,
    Flags.ViewChannel,
    Flags.EmbedLinks
] );

/**
 * What the owner of a dynamic channel is granted on it.
 *
 * Everything else stays neutral, so the owner keeps whatever the server already gives them and
 * gains nothing more. Managing the channel is the bot's job - the owner drives it through the
 * primary message buttons, not through Discord's own channel settings.
 *
 * `ReadMessageHistory` pairs with `SendMessages` and matches what a trusted user is granted, so the
 * owner is never left with less access to their own channel than the members they let in.
 */
export const DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        Flags.ViewChannel,
        Flags.Connect,
        Flags.SendMessages,
        Flags.ReadMessageHistory
    ]
};

/**
 * What the bot's own guild role has to hold for the dynamic channel features to work.
 *
 * This is only ever read by `getMissingPermissions()` against the guild - it is never written to a
 * channel, so nothing inherits it. The website's "optimal" invite grants exactly this set.
 */
export const DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS = {
    allow: [
        Flags.Connect,
        Flags.ManageChannels,
        Flags.ManageMessages,
        Flags.ManageRoles,
        Flags.MoveMembers,
        Flags.ReadMessageHistory,
        Flags.SendMessages,
        Flags.ViewChannel,
        Flags.EmbedLinks
        // Flags.ManageGuild,
    ]
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS = {
    deny: [ Flags.SendMessages ]
};

/**
 * What each verified role is granted on a master channel, and through inheritance on every dynamic
 * channel created from it.
 *
 * Verified roles are the channel's audience, so they have to be able to reach the generator and the
 * channels it spawns. On a server that hides its channels from `@everyone` this grant is the only
 * thing that lets the chosen role see and join them at all - without it a narrower audience than
 * `@everyone` produces channels nobody can enter.
 *
 * `Connect` and `ViewChannel` are exactly the two flags the privacy state flips, so a dynamic
 * channel going private or hidden simply denies back what it inherited here.
 */
export const DEFAULT_MASTER_CHANNEL_CREATE_VERIFIED_ROLES_PERMISSIONS = {
    type: OverwriteType.Role,
    allow: [
        Flags.ViewChannel,
        Flags.Connect
    ]
};

/**
 * What the bot grants itself on a master channel, and through inheritance on every dynamic channel
 * created from it.
 *
 * Everything outside this list stays neutral, so the channel never widens what the bot can do
 * beyond what its guild role already allows - these overwrites only keep the bot working in a
 * channel whose category or role setup would otherwise shut it out.
 */
export const DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS = {
    type: OverwriteType.Member,
    allow: [
        Flags.ViewChannel,
        Flags.ManageChannels,
        Flags.ManageWebhooks,
        Flags.Connect,
        Flags.Speak,
        Flags.MoveMembers,
        Flags.SendMessages,
        Flags.EmbedLinks
    ]
};

/**
 * What the bot has to hold on a logs channel to be able to post to it.
 */
export const DEFAULT_LOGS_CHANNEL_BOT_PERMISSIONS = new PermissionsBitField( [
    Flags.ViewChannel,
    Flags.SendMessages,
    Flags.EmbedLinks
] );

export const DEFAULT_SETUP_PERMISSIONS = [
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageRoles
];
