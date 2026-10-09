import { DEMO_MEMBERS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import type { DiscordChannelListItem, DiscordChannelUser } from "@vertix.gg/discord-ui";

import type {
    RoleWalkthroughRole,
    RoleWalkthroughStep,
    RoleWalkthroughView
} from "@vertix.gg/website/src/vertix/pages/features/server-roles/role-walkthrough";

/**
 * A team lobby through its host's eyes, told the way the role pages tell theirs: one member's card
 * and one channel list per step, stepped by the reader.
 *
 * Names are the bot's own defaults (`naming-config.ts`) - the categories, the lobby, the team colours
 * and the group rooms. A room carries a member counter only where it has a user limit, as in Discord:
 * picked teams and groups are held to a size, dealt teams are not.
 */

export const TEAM_LOBBY_CATEGORY_NAME = "༄ Team Lobby";

export const TEAM_LOBBY_NAME = "🎮 Team Lobby";

/** The read only text channel beside the lobby that its panel is posted in. */
export const TEAM_LOBBY_PANEL_NAME = "🎮・lobby-panel";

/** The category a split's rooms open in, right below the lobby's - `naming-config.ts`'s `↳ {lobby}`. */
export const TEAM_LOBBY_SESSION_CATEGORY_NAME = `↳ ${ TEAM_LOBBY_NAME }`;

export const TEAM_LOBBY_HOST_ROLE = "Organizer";

const MEMBER_ROLE: RoleWalkthroughRole = { name: "Member", color: "#2ecc71" };

const HOST_ROLE: RoleWalkthroughRole = { name: TEAM_LOBBY_HOST_ROLE, color: "#e67e22" };

const { alex, jordan, mia } = DEMO_MEMBERS;

const sam = { id: "sam", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/4.png" },
    noa = { id: "noa", username: "Noa", avatar: "https://cdn.discordapp.com/embed/avatars/5.png" },
    lee = { id: "lee", username: "Lee", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };

const EVERYONE = [ alex, jordan, mia, sam, noa, lee ];

function lobby( users: DiscordChannelUser[] ): DiscordChannelListItem {
    return { id: "lobby", name: TEAM_LOBBY_NAME, users, active: users.includes( alex ) };
}

function room(
    id: string,
    name: string,
    users: DiscordChannelUser[],
    options: { maxUsers?: number; highlighted?: boolean } = {}
): DiscordChannelListItem {
    const { maxUsers, highlighted } = options;

    return {
        id,
        name,
        users,
        active: users.includes( alex ),
        ...( maxUsers ? { userCount: users.length, maxUsers } : {} ),
        ...( highlighted ? { highlighted } : {} )
    };
}

/**
 * Alex's list: the lobby and its panel channel in their own category - the text channel first, as
 * Discord lists them - and, while it is split, the split's rooms in a category of their own right below.
 */
function hostView( lobbyChannel: DiscordChannelListItem, rooms: DiscordChannelListItem[] = [] ): RoleWalkthroughView {
    return {
        member: { name: alex.username, avatar: alex.avatar ?? "" },
        roles: [ MEMBER_ROLE, HOST_ROLE ],
        categories: [
            { title: TEAM_LOBBY_CATEGORY_NAME, channels: [ { id: "lobby-panel", name: TEAM_LOBBY_PANEL_NAME, kind: "text" }, lobbyChannel ] },
            ...( rooms.length ? [ { title: TEAM_LOBBY_SESSION_CATEGORY_NAME, channels: rooms } ] : [] )
        ]
    };
}

export const TEAM_LOBBY_WALKTHROUGH: RoleWalkthroughStep[] = [
    {
        title: "Everyone gathers in the lobby",
        description: `Six players join ${ TEAM_LOBBY_NAME } and stay there - a lobby sends nobody to a room of their ` +
            `own. ${ alex.username } holds @${ TEAM_LOBBY_HOST_ROLE }, the role this lobby names as its host.`,
        views: [ hostView( lobby( EVERYONE ) ) ]
    },
    {
        title: "🎲 Random teams, 2",
        description: "The six are shuffled into 🔴 Team 1 and 🔵 Team 2, three each, and moved - in a category of " +
            `the split's own, ${ TEAM_LOBBY_SESSION_CATEGORY_NAME }, right below the lobby's. The lobby stays where ` +
            "it is, empty, for when they come back.",
        views: [ hostView( lobby( [] ), [
            room( "team-1", "🔴 Team 1", [ alex, mia, lee ], { highlighted: true } ),
            room( "team-2", "🔵 Team 2", [ jordan, sam, noa ], { highlighted: true } )
        ] ) ]
    },
    {
        title: "↩️ Recall",
        description: "The match is over. Everyone is moved back to the lobby, and both team rooms close with " +
            "their category - the lobby is the one place two teams can talk to each other.",
        views: [ hostView( lobby( EVERYONE ) ) ]
    },
    {
        title: "🙋 Pick teams, 2",
        description: "This time two team rooms open empty in a new category, each held to three - its share of " +
            "the six. Nobody is moved: each player joins the room they want.",
        views: [ hostView( lobby( EVERYONE ), [
            room( "team-1", "🔴 Team 1", [], { maxUsers: 3, highlighted: true } ),
            room( "team-2", "🔵 Team 2", [], { maxUsers: 3, highlighted: true } )
        ] ) ]
    },
    {
        title: "Everyone picks a side",
        description: "Each room takes three and no more, so the teams come out even however people choose - and " +
            "once in, nobody can hop over to the other side's room to listen in.",
        views: [ hostView( lobby( [] ), [
            room( "team-1", "🔴 Team 1", [ alex, jordan, mia ], { maxUsers: 3 } ),
            room( "team-2", "🔵 Team 2", [ sam, noa, lee ], { maxUsers: 3 } )
        ] ) ]
    },
    {
        title: "👥 Groups of 2, after another Recall",
        description: "Study time: everyone is paired up in rooms held to two, so nobody wanders into another " +
            "pair's. Bigger groups, up to ten, are dealt the same way.",
        views: [ hostView( lobby( [] ), [
            room( "group-1", "👥 Group 1", [ alex, sam ], { maxUsers: 2, highlighted: true } ),
            room( "group-2", "👥 Group 2", [ jordan, noa ], { maxUsers: 2, highlighted: true } ),
            room( "group-3", "👥 Group 3", [ mia, lee ], { maxUsers: 2, highlighted: true } )
        ] ) ]
    },
    {
        title: "Everyone logs off",
        description: "Nobody is left in the lobby or any of its rooms, so the rooms and their category close on " +
            "their own - nobody has to come back and press Recall.",
        views: [ hostView( lobby( [] ) ) ]
    }
];
