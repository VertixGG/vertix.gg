import { PermissionsBitField } from "discord.js";

/**
 * How a team lobby can be split.
 *
 * - `random-teams` - everyone in the lobby dealt evenly into a number of team rooms, and moved.
 * - `pick-teams` - the team rooms opened empty, each held to its share of the lobby, for members to
 *   walk into the one they want.
 * - `groups` - everyone in the lobby dealt into rooms of a size, and moved.
 */
export const TEAM_LOBBY_SPLIT_MODES = {
    RANDOM_TEAMS: "random-teams",
    PICK_TEAMS: "pick-teams",
    GROUPS: "groups"
} as const;

export type TTeamLobbySplitMode = typeof TEAM_LOBBY_SPLIT_MODES[ keyof typeof TEAM_LOBBY_SPLIT_MODES ];

/**
 * What a split may ask for. Teams stop at as many as there are team colours to tell them apart by.
 * Groups start at two - a group of one is a member alone in a room - and stop at a size past which a
 * group is a lobby of its own.
 */
export const TEAM_LOBBY_LIMITS = {
    TEAMS_MIN: 2,
    TEAMS_MAX: 8,
    GROUP_SIZE_MIN: 2,
    GROUP_SIZE_MAX: 10
} as const;

/**
 * How long a screen asking how to split is drawn again as members come and go. Discord takes an
 * interaction's edits for fifteen minutes, so past that the bot could not redraw it anyway.
 */
export const TEAM_LOBBY_SCREEN_REDRAW_MS = 14 * 60 * 1000;

/** Where a team room's colour goes in its name - beside `{index}`, which every room name takes. */
export const VAR_TEAM_LOBBY_ROOM_COLOR = "{color}" as const;

/** Where the lobby's own name goes in the name of the category a split opens. */
export const VAR_TEAM_LOBBY_NAME = "{lobby}" as const;

/**
 * What the bot must hold on a lobby to split it and call it back: see it, enter it, move members out
 * of it and into it, open and close rooms beside it, and keep each team out of the other teams' rooms.
 */
export const TEAM_LOBBY_BOT_PERMISSIONS = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.MoveMembers,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageRoles
];

/**
 * Why a lobby was not split, or not called back - what the service answers and the screens say back.
 */
export const TEAM_LOBBY_REFUSALS = {
    /** The lobby is one of the setups past the server's allowance, which do nothing until it grows. */
    NOT_COVERED: "not-covered",

    /** The member is neither an admin nor a host, and the lobby names hosts. */
    NOT_HOST: "not-host",

    /** The lobby is split already - it is called back before it is split again. */
    ALREADY_SPLIT: "already-split",

    /** There is no split to call back. */
    NOT_SPLIT: "not-split",

    /** Nobody is in the lobby to split. */
    NOBODY_TO_SPLIT: "nobody-to-split",

    /** Fewer members than teams, or than one group's size - a team of nobody is not a team. */
    TOO_FEW_MEMBERS: "too-few-members",

    /** A team count or group size outside what a split may ask for. */
    INVALID_COUNT: "invalid-count",

    /** More rooms than one setup may open at once. */
    TOO_MANY_ROOMS: "too-many-rooms",

    /** The bot is missing something it needs on the lobby. */
    MISSING_PERMISSIONS: "missing-permissions",

    /** Discord refused to make a room. */
    FAILED: "failed"
} as const;

export type TTeamLobbyRefusal = typeof TEAM_LOBBY_REFUSALS[ keyof typeof TEAM_LOBBY_REFUSALS ];
