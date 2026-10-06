import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import type { DiscordChannelListItem, DiscordChannelUser } from "@vertix.gg/discord-ui";

import type {
    RoleWalkthroughCategory,
    RoleWalkthroughRole,
    RoleWalkthroughStep,
    RoleWalkthroughView
} from "@vertix.gg/website/src/vertix/pages/features/server-roles/role-walkthrough";

/**
 * The three role pages, each told through one member's channel list.
 *
 * Channel names are the bot's own defaults (`naming-config.ts`), and a room carries no member
 * counter because a room without a user limit shows none in Discord. The padlock marks a private
 * room for everybody who sees it, as on the other feature pages; a hidden room wears none, it is
 * simply missing from the list of whoever it hides from.
 */

const DYNAMIC_CHANNELS_CATEGORY_NAME = "༄ Dynamic Channels";

const GENERATOR: DiscordChannelListItem = { id: "generator", name: "➕ New Channel" };

const MEMBER_ROLE: RoleWalkthroughRole = { name: "Member", color: "#2ecc71" };

const VOICE_ROLE: RoleWalkthroughRole = { name: "Voice", color: "#3498db" };

const MODERATOR_ROLE: RoleWalkthroughRole = { name: "Moderator", color: "#e67e22" };

const { alex, jordan, mia, owner } = DEMO_MEMBERS;

/** Somebody who has only just joined the server, and so holds no roles yet. */
const sam = { id: "sam", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/4.png" };

function asMember( user: DiscordChannelUser ) {
    return { name: user.username, avatar: user.avatar ?? "" };
}

function voiceChannel(
    id: string,
    name: string,
    users: DiscordChannelUser[],
    options: { active?: boolean; locked?: boolean; highlighted?: boolean } = {}
): DiscordChannelListItem {
    return { id, name, users, ...options };
}

// --- Server Voice Role ---------------------------------------------------------------------------

const HANGOUT_CATEGORY_NAME = "💬 Hangout";

const GENERAL_CHANNEL: DiscordChannelListItem = { id: "general", name: "general", kind: "text" };

/** Open to @Voice alone, which is what makes the role visible from the outside. */
const VOICE_CHAT_CHANNEL: DiscordChannelListItem = { id: "voice-chat", name: "voice-chat", kind: "text", highlighted: true };

const JORDAN_CHANNEL_NAME = `${ jordan.username }'s Channel`;

const ALEX_CHANNEL_NAME = `${ alex.username }'s Channel`;

/**
 * Alex's list. Whenever Alex holds @Voice it was given in that very step, so the role and the
 * channel it opens are both ringed.
 */
function alexVoiceView( options: {
    holdsVoice: boolean;
    inLounge?: boolean;
    rooms: DiscordChannelListItem[];
} ): RoleWalkthroughView {
    return {
        member: asMember( alex ),
        roles: options.holdsVoice ? [ MEMBER_ROLE, { ...VOICE_ROLE, isNew: true } ] : [ MEMBER_ROLE ],
        categories: [
            {
                title: HANGOUT_CATEGORY_NAME,
                channels: [
                    GENERAL_CHANNEL,
                    ...( options.holdsVoice ? [ VOICE_CHAT_CHANNEL ] : [] ),
                    voiceChannel( "lounge", "Lounge", options.inLounge ? [ alex ] : [], { active: options.inLounge } )
                ]
            },
            {
                title: DYNAMIC_CHANNELS_CATEGORY_NAME,
                channels: [ GENERATOR, ...options.rooms ]
            }
        ]
    };
}

export const VOICE_ROLE_WALKTHROUGH: RoleWalkthroughStep[] = [
    {
        title: `${ alex.username } is not in voice`,
        description: "No room, so no @Voice - and #voice-chat, a channel only @Voice can see, is not on " +
            `${ alex.username }'s list.`,
        views: [
            alexVoiceView( {
                holdsVoice: false,
                rooms: [ voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan ] ) ]
            } )
        ]
    },
    {
        title: `${ alex.username } joins ➕ New Channel`,
        description: `The generator makes ${ ALEX_CHANNEL_NAME } and moves ${ alex.username } into it. Landing ` +
            "there hands over @Voice, and #voice-chat appears.",
        views: [
            alexVoiceView( {
                holdsVoice: true,
                rooms: [
                    voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan ] ),
                    voiceChannel( "alex", ALEX_CHANNEL_NAME, [ alex ], { active: true } )
                ]
            } )
        ]
    },
    {
        title: `${ alex.username } moves to Lounge`,
        description: "Lounge is the server's own channel, not a room the bot made, so @Voice comes off and " +
            `#voice-chat goes with it. The empty ${ ALEX_CHANNEL_NAME } is deleted.`,
        views: [
            alexVoiceView( {
                holdsVoice: false,
                inLounge: true,
                rooms: [ voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan ] ) ]
            } )
        ]
    },
    {
        title: `${ alex.username } joins ${ JORDAN_CHANNEL_NAME }`,
        description: "Any room the bot made counts, not only your own - @Voice is back, and so is #voice-chat.",
        views: [
            alexVoiceView( {
                holdsVoice: true,
                rooms: [ voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan, alex ], { active: true } ) ]
            } )
        ]
    },
    {
        title: `${ alex.username } leaves voice`,
        description: "Leaving takes @Voice off at once, and #voice-chat disappears again.",
        views: [
            alexVoiceView( {
                holdsVoice: false,
                rooms: [ voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan ] ) ]
            } )
        ]
    }
];

// --- Server Verified Roles -----------------------------------------------------------------------

/** Where a server that gates itself sends a newcomer - all they see until they earn @Member. */
const WELCOME_CATEGORY: RoleWalkthroughCategory = {
    title: "📌 Welcome",
    channels: [
        { id: "rules", name: "rules", kind: "text" },
        { id: "get-verified", name: "get-verified", kind: "text" }
    ]
};

function samView( holdsMember: boolean, dynamicChannels: DiscordChannelListItem[] | null, isMemberNew = false ): RoleWalkthroughView {
    return {
        member: asMember( sam ),
        roles: holdsMember ? [ { ...MEMBER_ROLE, isNew: isMemberNew } ] : [],
        categories: dynamicChannels
            ? [ WELCOME_CATEGORY, { title: DYNAMIC_CHANNELS_CATEGORY_NAME, channels: dynamicChannels } ]
            : [ WELCOME_CATEGORY ]
    };
}

export const VERIFIED_ROLES_WALKTHROUGH: RoleWalkthroughStep[] = [
    {
        title: "Verified roles: @everyone",
        description: `The default. Every member sees the generator and the public rooms it makes - ${ sam.username }, ` +
            "who has just joined the server and holds no roles yet, included.",
        views: [ samView( false, [ GENERATOR ] ) ]
    },
    {
        title: "Narrowed to @Member",
        description: `${ sam.username } holds no @Member, so the generator, its category and every room it makes ` +
            `are gone from ${ sam.username }'s list. Only what the server shows everyone is left.`,
        views: [ samView( false, null ) ]
    },
    {
        title: `${ sam.username } earns @Member`,
        description: `The generator is back on ${ sam.username }'s list, and ${ sam.username } can open a room with it.`,
        views: [ samView( true, [ { ...GENERATOR, highlighted: true } ], true ) ]
    },
    {
        title: `${ jordan.username } opens a room`,
        description: "It is public - which here means public to @Member, so " +
            `${ sam.username } sees it and can join it.`,
        views: [ samView( true, [ GENERATOR, voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan ], { highlighted: true } ) ] ) ]
    },
    {
        title: `${ jordan.username } makes it Private`,
        description: `Private stops the roles on the list from connecting. ${ sam.username } still sees the room and ` +
            `who is in it, but cannot join unless ${ jordan.username } trusts ${ sam.username }.`,
        views: [
            samView( true, [
                GENERATOR,
                voiceChannel( "jordan", JORDAN_CHANNEL_NAME, [ jordan ], { locked: true, highlighted: true } )
            ] )
        ]
    },
    {
        title: `${ jordan.username } hides it`,
        description: `Hidden takes the room off the list of every member ${ jordan.username } has not trusted - ` +
            `${ sam.username } included.`,
        views: [ samView( true, [ GENERATOR ] ) ]
    }
];

// --- Server Staff Roles --------------------------------------------------------------------------

/** The same room through two pairs of eyes: an ordinary member, and one holding a staff role. */
function staffViews( alexSees: DiscordChannelListItem | null, miaSees: DiscordChannelListItem | null ): RoleWalkthroughView[] {
    return [
        {
            member: asMember( alex ),
            roles: [ MEMBER_ROLE ],
            categories: [ { title: DYNAMIC_CHANNELS_CATEGORY_NAME, channels: alexSees ? [ GENERATOR, alexSees ] : [ GENERATOR ] } ]
        },
        {
            member: asMember( mia ),
            roles: [ MEMBER_ROLE, MODERATOR_ROLE ],
            categories: [ { title: DYNAMIC_CHANNELS_CATEGORY_NAME, channels: miaSees ? [ GENERATOR, miaSees ] : [ GENERATOR ] } ]
        }
    ];
}

function ownerRoom( users: DiscordChannelUser[], options: { active?: boolean; locked?: boolean; highlighted?: boolean } = {} ) {
    return voiceChannel( "owner", DEMO_CHANNEL_NAME, users, options );
}

export const STAFF_ROLES_WALKTHROUGH: RoleWalkthroughStep[] = [
    {
        title: `${ DEMO_OWNER }'s room is public`,
        description: `${ alex.username } and ${ mia.username } can both see it and join it. ${ mia.username } holds ` +
            "@Moderator, one of the server's staff roles.",
        views: staffViews( ownerRoom( [ owner ] ), ownerRoom( [ owner ] ) )
    },
    {
        title: `${ DEMO_OWNER } makes it Private`,
        description: `The padlock is there for both, but only ${ alex.username } is kept out - privacy is never ` +
            "written onto a staff role.",
        views: staffViews(
            ownerRoom( [ owner ], { locked: true, highlighted: true } ),
            ownerRoom( [ owner ], { locked: true, highlighted: true } )
        )
    },
    {
        title: `${ mia.username } joins`,
        description: `Nobody had to trust ${ mia.username } first. ${ alex.username } can see who is inside, and ` +
            "still cannot join.",
        views: staffViews(
            ownerRoom( [ owner, mia ], { locked: true } ),
            ownerRoom( [ owner, mia ], { locked: true, active: true } )
        )
    },
    {
        title: `${ DEMO_OWNER } tries to kick ${ mia.username }`,
        description: `The bot refuses, and tells ${ DEMO_OWNER } why. Block refuses a staff member the same way.`,
        views: staffViews(
            ownerRoom( [ owner, mia ], { locked: true } ),
            ownerRoom( [ owner, mia ], { locked: true, active: true } )
        ),
        notice: (
            <div className="discord-chat-container m-0">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 9:12 PM"
                    componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                    preferredEmbedsGroup="VertixBot/UI-General/StaffMemberEmbedGroup"
                    variables={ { staffMemberDisplayName: mia.username } }
                    hideElements={ true }
                    ephemeral={ true }
                />
            </div>
        )
    },
    {
        title: `${ DEMO_OWNER } hides the room`,
        description: `It drops off ${ alex.username }'s list. ${ mia.username } keeps it, and can come and go.`,
        views: staffViews( null, ownerRoom( [ owner, mia ], { active: true } ) )
    }
];
