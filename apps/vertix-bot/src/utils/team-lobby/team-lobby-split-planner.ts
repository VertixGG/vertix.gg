import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { varsReplaceIndexPlaceholder } from "@vertix.gg/base/src/utils/vars-utils";

import {
    TEAM_LOBBY_LIMITS,
    TEAM_LOBBY_SPLIT_MODES,
    VAR_TEAM_LOBBY_ROOM_COLOR
} from "@vertix.gg/bot/src/definitions/team-lobby";

import type { TTeamLobbySplitMode } from "@vertix.gg/bot/src/definitions/team-lobby";

/** What a split asks for: how, how many - teams, or members to a group - and who is there to split. */
export interface ITeamLobbySplitRequest {
    mode: TTeamLobbySplitMode;
    count: number;
    memberIds: readonly string[];
}

/** What the rooms of a split are called - the naming configuration's part of it. */
export interface ITeamLobbyRoomNaming {
    teamRoomName: string;
    teamRoomColors: readonly string[];
    groupRoomName: string;
}

/** One room a split opens. */
export interface ITeamLobbyRoomPlan {
    name: string;

    /** Zero is no limit, as discord reads it. */
    userLimit: number;

    /** Who is moved into it - nobody, for a room members walk into themselves. */
    memberIds: string[];
}

/**
 * Who goes to which room when a team lobby splits - the rules of it, kept apart from anything that
 * reads or writes, so each can be pinned down on its own.
 *
 * Members are dealt one at a time round the rooms after a shuffle, which is what keeps any two rooms
 * within one member of each other: teams come out even, and groups of a size never go over it.
 */
export class TeamLobbySplitPlanner extends InitializeBase {
    private static instance: TeamLobbySplitPlanner;

    public static getName() {
        return "VertixBot/Utils/TeamLobbySplitPlanner";
    }

    public static get $() {
        if ( ! TeamLobbySplitPlanner.instance ) {
            TeamLobbySplitPlanner.instance = new TeamLobbySplitPlanner();
        }

        return TeamLobbySplitPlanner.instance;
    }

    public constructor() {
        super();
    }

    /**
     * Function isValidCount() :: Whether this is a number of teams, or a group size, a split may ask for.
     */
    public isValidCount( mode: TTeamLobbySplitMode, count: number ): boolean {
        if ( ! Number.isInteger( count ) ) {
            return false;
        }

        if ( TEAM_LOBBY_SPLIT_MODES.GROUPS === mode ) {
            return count >= TEAM_LOBBY_LIMITS.GROUP_SIZE_MIN && count <= TEAM_LOBBY_LIMITS.GROUP_SIZE_MAX;
        }

        return count >= TEAM_LOBBY_LIMITS.TEAMS_MIN && count <= TEAM_LOBBY_LIMITS.TEAMS_MAX;
    }

    /**
     * Function countRooms() :: How many rooms a split opens - answered before any is made, so the
     * limits can be asked first.
     */
    public countRooms( request: ITeamLobbySplitRequest ): number {
        if ( TEAM_LOBBY_SPLIT_MODES.GROUPS === request.mode ) {
            return Math.ceil( request.memberIds.length / request.count );
        }

        return request.count;
    }

    /**
     * Function plan() :: The rooms a split opens, what each is called and held to, and who goes in it.
     *
     * Picked teams open empty, each held to its share of the lobby so the teams come out even - or to
     * nothing, while the lobby holds fewer members than there are teams. Groups are held to their size,
     * so a group stays the group it was dealt; dealt teams are held to nothing, since nobody walking in afterwards
     * makes one uneven by more than the walk.
     */
    public plan(
        request: ITeamLobbySplitRequest,
        naming: ITeamLobbyRoomNaming,
        random: () => number = Math.random
    ): ITeamLobbyRoomPlan[] {
        const { mode, count, memberIds } = request,
            roomsCount = this.countRooms( request );

        const names = Array.from( { length: roomsCount }, ( _, index ) => this.nameRoom( mode, count, index + 1, naming ) );

        if ( TEAM_LOBBY_SPLIT_MODES.PICK_TEAMS === mode ) {
            const userLimit = memberIds.length >= count ? Math.ceil( memberIds.length / count ) : 0;

            return names.map( ( name ) => ( { name, userLimit, memberIds: [] } ) );
        }

        const dealt = this.deal( this.shuffle( memberIds, random ), roomsCount ),
            userLimit = TEAM_LOBBY_SPLIT_MODES.GROUPS === mode ? count : 0;

        return names.map( ( name, index ) => ( { name, userLimit, memberIds: dealt[ index ] } ) );
    }

    /**
     * Function shuffle() :: The ids in a random order - Fisher-Yates, so every order is as likely as any
     * other. `random` answers in [0, 1), as `Math.random()` does.
     */
    public shuffle( ids: readonly string[], random: () => number ): string[] {
        const shuffled = [ ... ids ];

        for ( let i = shuffled.length - 1; i > 0; i-- ) {
            const j = Math.floor( random() * ( i + 1 ) );

            [ shuffled[ i ], shuffled[ j ] ] = [ shuffled[ j ], shuffled[ i ] ];
        }

        return shuffled;
    }

    /**
     * Function deal() :: The ids dealt round the rooms one at a time, the first id to the first room.
     */
    public deal( ids: readonly string[], roomsCount: number ): string[][] {
        const rooms: string[][] = Array.from( { length: roomsCount }, () => [] );

        ids.forEach( ( id, index ) => rooms[ index % roomsCount ].push( id ) );

        return rooms;
    }

    /**
     * Function nameRoom() :: What the room at this place in a split is called, counted from one.
     */
    public nameRoom( mode: TTeamLobbySplitMode, count: number, index: number, naming: ITeamLobbyRoomNaming ): string {
        if ( TEAM_LOBBY_SPLIT_MODES.GROUPS === mode ) {
            return varsReplaceIndexPlaceholder( naming.groupRoomName, index );
        }

        const colors = naming.teamRoomColors,
            color = colors.length ? colors[ ( index - 1 ) % colors.length ] : "";

        return varsReplaceIndexPlaceholder( naming.teamRoomName.replace( VAR_TEAM_LOBBY_ROOM_COLOR, color ), index ).trim();
    }
}

export default TeamLobbySplitPlanner;
