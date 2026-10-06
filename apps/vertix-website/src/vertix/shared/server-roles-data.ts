import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import type { DiscordChannelListItem, DiscordChannelUser, WizardStep } from "@vertix.gg/discord-ui";

/**
 * What the three server role pages show in place of what the bot would work out.
 *
 * Each role is a name a server would give it, written the way the bot's own embeds write a role -
 * `<@&...>` - which the preview draws as a mention. One word each, because that is all the
 * preview's mention pattern carries: a name with a space in it is left standing as markup.
 */

export const VOICE_ROLE_MENTION = "<@&Voice>";

export const VERIFIED_ROLE_MENTION = "<@&Member>";

export const STAFF_ROLE_MENTIONS = "<@&Moderator>, <@&Helper>";

/**
 * How a generator that has no list of its own shows the server's, on its own screens.
 *
 * Copied from the `*(from the server options)*` the bot appends, so the per-generator previews read
 * the way the screen does on a generator nobody has touched.
 */
export const FROM_SERVER_OPTIONS = "*(from the server options)*";

export const DYNAMIC_CHANNELS_CATEGORY_NAME = "༄ Dynamic Channels";

export const GENERATOR_CHANNEL_NAME = "➕ New Channel";

const GENERATOR = { name: GENERATOR_CHANNEL_NAME, active: false, userCount: 0 };

function room( id: string, name: string, users: DiscordChannelUser[], locked = false ): DiscordChannelListItem {
    return {
        id,
        name,
        active: users.length > 0,
        userCount: users.length,
        maxUsers: 0,
        locked,
        users
    };
}

function generatorWith( channels: DiscordChannelListItem[] ): WizardStep[ "channelDisplayProps" ] {
    return {
        categoryName: DYNAMIC_CHANNELS_CATEGORY_NAME,
        masterChannel: GENERATOR,
        showMasterChannel: true,
        scaledChannels: channels
    };
}

const { alex, jordan, mia, owner } = DEMO_MEMBERS;

const ALEX_CHANNEL_NAME = `${ alex.username }'s Channel`;

/** A voice channel of the server's own, which the bot did not make and gives no role for. */
const LOUNGE_CHANNEL_NAME = "🔊 Lounge";

function voiceRoleChannels( inRoom: DiscordChannelUser[], inLounge: DiscordChannelUser[] ) {
    return generatorWith( [
        ...( inRoom.length ? [ room( "alex", ALEX_CHANNEL_NAME, inRoom ) ] : [] ),
        room( "lounge", LOUNGE_CHANNEL_NAME, inLounge )
    ] );
}

/** Alex and Jordan, an evening of the voice role @Voice. */
export const VOICE_ROLE_WIZARD_STEPS: WizardStep[] = [
    {
        title: `${ alex.username } joins ${ GENERATOR_CHANNEL_NAME }`,
        description: `The generator opens ${ ALEX_CHANNEL_NAME } and moves ${ alex.username } into it - ` +
            `landing there hands ${ alex.username } @Voice`,
        titleClassName: "text-success",
        channelDisplayProps: voiceRoleChannels( [ alex ], [] )
    },
    {
        title: `${ jordan.username } joins ${ ALEX_CHANNEL_NAME }`,
        description: "Everyone in the room holds @Voice, not only its owner",
        titleClassName: "text-success",
        channelDisplayProps: voiceRoleChannels( [ alex, jordan ], [] )
    },
    {
        title: `${ alex.username } moves to ${ LOUNGE_CHANNEL_NAME }`,
        description: `Lounge is not a room the bot made, so @Voice comes off ${ alex.username } - ` +
            `${ jordan.username } keeps it`,
        titleClassName: "text-warning",
        channelDisplayProps: voiceRoleChannels( [ jordan ], [ alex ] )
    },
    {
        title: `${ jordan.username } leaves voice`,
        description: `@Voice comes off ${ jordan.username }, and the empty room is deleted`,
        titleClassName: "text-primary",
        channelDisplayProps: voiceRoleChannels( [], [ alex ] )
    }
];

/** Where a server that gates itself sends a newcomer - the only channels they see until they earn @Member. */
export const WELCOME_CATEGORY_NAME = "📌 Welcome";

export const WELCOME_CHANNELS: DiscordChannelListItem[] = [
    { id: "rules", name: "rules", kind: "text" },
    { id: "get-verified", name: "get-verified", kind: "text" }
];

/** The generator and a room in it, as somebody on the verified list sees them. */
export const VERIFIED_VIEW_CHANNELS: DiscordChannelListItem[] = [
    { id: "generator", name: GENERATOR_CHANNEL_NAME },
    room( "owner", DEMO_CHANNEL_NAME, [ owner, jordan ] )
];

/**
 * The same room, as somebody holding @Member sees it through the three states an owner can put it
 * in. Hidden takes it off their list, which is the step where it is missing.
 */
export const VERIFIED_ROLES_WIZARD_STEPS: WizardStep[] = [
    {
        title: "Public",
        description: `Anyone holding @Member sees ${ DEMO_CHANNEL_NAME } and can join it`,
        titleClassName: "text-success",
        channelDisplayProps: generatorWith( [ room( "owner", DEMO_CHANNEL_NAME, [ owner, jordan ] ) ] )
    },
    {
        title: "Private",
        description: `@Member still sees it, but cannot connect - unless ${ DEMO_OWNER } trusts them`,
        titleClassName: "text-warning",
        channelDisplayProps: generatorWith( [ room( "owner", DEMO_CHANNEL_NAME, [ owner, jordan ], true ) ] )
    },
    {
        title: "Hidden",
        description: "Gone from @Member's channel list - the members trusted in it and the staff roles still see it",
        titleClassName: "text-primary",
        channelDisplayProps: generatorWith( [] )
    }
];

/** A private room, and a moderator it cannot keep out. */
export const STAFF_ROLES_WIZARD_STEPS: WizardStep[] = [
    {
        title: `${ DEMO_OWNER } makes the room private`,
        description: `Members still see ${ DEMO_CHANNEL_NAME }, but only those ${ DEMO_OWNER } trusts can connect`,
        titleClassName: "text-warning",
        channelDisplayProps: generatorWith( [ room( "owner", DEMO_CHANNEL_NAME, [ owner, alex ], true ) ] )
    },
    {
        title: `${ mia.username } joins anyway`,
        description: `${ mia.username } holds @Moderator, a staff role - no private room shuts it out, ` +
            `and nobody had to trust ${ mia.username } first`,
        titleClassName: "text-success",
        channelDisplayProps: generatorWith( [ room( "owner", DEMO_CHANNEL_NAME, [ owner, alex, mia ], true ) ] )
    },
    {
        title: `${ DEMO_OWNER } tries to block ${ mia.username }`,
        description: `Block refuses, and so would Kick - ${ mia.username } holds a staff role`,
        titleClassName: "text-warning",
        channelDisplayProps: generatorWith( [ room( "owner", DEMO_CHANNEL_NAME, [ owner, alex, mia ], true ) ] )
    },
    {
        title: "The room goes hidden",
        description: `It drops off the channel list of every member ${ DEMO_OWNER } has not trusted - ` +
            `${ mia.username } still sees it`,
        titleClassName: "text-primary",
        channelDisplayProps: generatorWith( [ room( "owner", DEMO_CHANNEL_NAME, [ owner, alex, mia ], true ) ] )
    }
];
