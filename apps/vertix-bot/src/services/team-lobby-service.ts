import crypto from "node:crypto";

import "@vertix.gg/prisma/bot-client";

import { ChannelType, MessageFlags, OverwriteType, PermissionsBitField } from "discord.js";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { getNaming } from "@vertix.gg/data/src/config/naming";
import { VERSION_LOBBY_CHANNEL_UI_V1 } from "@vertix.gg/data/src/config/lobby-channel-config";
import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { LobbyChannelDataModel } from "@vertix.gg/data/src/models/master-channel/lobby-channel-data-model";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";
import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { ownsGuild } from "@vertix.gg/bot/src/definitions/sharding";
import {
    DEFAULT_CONTROL_PANEL_DENY_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS,
    DEFAULT_SETUP_PERMISSIONS
} from "@vertix.gg/bot/src/definitions/master-channel";
import {
    TEAM_LOBBY_BOT_PERMISSIONS,
    TEAM_LOBBY_REFUSALS,
    TEAM_LOBBY_SPLIT_MODES,
    VAR_TEAM_LOBBY_NAME
} from "@vertix.gg/bot/src/definitions/team-lobby";

import { TeamLobbySplitPlanner } from "@vertix.gg/bot/src/utils/team-lobby/team-lobby-split-planner";
import { ChannelUtils } from "@vertix.gg/bot/src/utils/channel-utils";

import type { CategoryChannel, Guild, GuildMember, OverwriteResolvable, TextChannel, VoiceChannel } from "discord.js";

import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type { TTeamLobbyRefusal, TTeamLobbySplitMode } from "@vertix.gg/bot/src/definitions/team-lobby";
import type { ITeamLobbyRoomNaming, ITeamLobbyRoomPlan } from "@vertix.gg/bot/src/utils/team-lobby/team-lobby-split-planner";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type {
    CreateLobbySetupPayload,
    DeleteLobbySetupPayload
} from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";
import type { EntitlementService } from "@vertix.gg/bot/src/services/entitlement-service";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

/** How a panel's drawing is reduced to something storable - the same as a generator's control panel. */
const LOBBY_PANEL_HASH_ALGORITHM = "md5";

/** Seeing a room and joining it - what a team's room keeps from everybody else. */
const ROOM_ACCESS = PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.Connect;

/** Why the service did not do what it was asked, and what the screen saying so needs. */
export interface ITeamLobbyRefusal {
    code: TTeamLobbyRefusal;

    /** What the bot is missing on the lobby, for `missing-permissions`. */
    missingPermissions?: string[];

    /** How many rooms one setup may have open, for `too-many-rooms`. */
    roomsLimit?: number;
}

export interface ITeamLobbyCreateSuccess {
    code: "success";
    lobby: VoiceChannel;
    lobbyDB: ChannelExtended;
}

export interface ITeamLobbySplitSuccess {
    code: "success";
    rooms: VoiceChannel[];

    /** Members moved into their rooms, and members planned for one who had left the lobby by then. */
    moved: number;
    missed: number;
}

export interface ITeamLobbyRecallSuccess {
    code: "success";
    moved: number;
    missed: number;
}

export interface ITeamLobbySplitArgs {
    lobby: VoiceChannel;
    member: GuildMember;
    mode: TTeamLobbySplitMode;
    count: number;

    /** The members the split is for, picked by whoever split it - none for everyone in the lobby. */
    playerIds?: string[];
}

export interface ITeamLobbyRecallArgs {
    lobby: VoiceChannel;
    member: GuildMember;
}

/** A split worked out before anything is opened - who it is for, or why it cannot be made. */
type TPreparedSplit =
    | { refusal: ITeamLobbyRefusal }
    | { request: { mode: TTeamLobbySplitMode; count: number; memberIds: string[] } };

interface IMoveTally {
    moved: number;
    missed: number;
}

/**
 * Runs team lobbies - a voice channel members gather in, split from into team or group rooms beside
 * it, and called back to.
 *
 * A split lasts until it is called back, or until nobody is left in the lobby or any of its rooms. A
 * room is not closed for emptying while the split goes on: teams step out to the lobby and back, and
 * picked teams fill one member at a time, so an empty room is not yet a finished one.
 *
 * Each split opens its rooms in a category of its own, right below the lobby's - discord nests no
 * category inside another, so below is as close as it goes - and takes that category down when it
 * ends.
 *
 * What is split, called back or closed is done one thing at a time per lobby, so a second press
 * waits for the first rather than opening a second set of rooms beside it.
 */
export class TeamLobbyService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
    channelCleanupService: ChannelCleanupService;
    entitlementService: EntitlementService;
    uiService: UIService;
}> {
    /** The work in progress per lobby, by its discord id. */
    private readonly running = new Map<string, Promise<void>>();

    /**
     * The screens waiting on who is in a lobby - by the lobby's discord id, then by the screen's message
     * id - each drawn again when somebody comes into the lobby or leaves it.
     */
    private readonly presenceWatchers = new Map<string, Map<string, { redraw: () => Promise<void>; expiresAt: number }>>();

    public static getName() {
        return "VertixBot/Services/TeamLobby";
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            channelService: "VertixBot/Services/Channel",
            channelCleanupService: "VertixBot/Services/ChannelCleanup",
            entitlementService: "VertixBot/Services/Entitlement",
            uiService: "VertixGUI/UIService"
        };
    }

    protected async initialize() {
        await super.initialize();

        // Subscribed once the channel service is up - the event bus refuses a listener for an object
        // it has not registered yet.
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", ( args: IChannelLeaveGenericArgs ) => {
            this.onLeave( args ).catch( ( error ) => {
                this.logger.error( this.onLeave, `Guild id: '${ args.oldState.guild.id }' - Could not close a lobby's rooms`, error );
            } );
        } );

        // A move from the lobby into a room arrives as a join too, which is how a team is picked.
        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", ( args: IChannelEnterGenericArgs ) => {
            this.onJoin( args ).catch( ( error ) => {
                this.logger.error( this.onJoin, `Guild id: '${ args.newState.guild.id }' - Could not keep a member to their team's room`, error );
            } );
        } );

        EventBus.$.on( "VertixBot/Services/Channel", "onChannelGuildVoiceDelete", ( channel: VoiceChannel ) => {
            this.onChannelGuildVoiceDelete( channel ).catch( ( error ) => {
                this.logger.error( this.onChannelGuildVoiceDelete, `Guild id: '${ channel.guild.id }' - Could not clear a deleted lobby channel`, error );
            } );
        } );

        this.services.appService.onceReady( async() => {
            await this.closeAbandonedSplits().catch( ( error ) => {
                this.logger.error( this.closeAbandonedSplits, "Could not close the splits left from before the restart", error );
            } );

            // Not awaited, as generators' control panels are not: redrawing every lobby's panel is
            // catching up, and need not finish before the bot answers anybody.
            void this.refreshPanels().catch( ( error ) => {
                this.logger.error( this.refreshPanels, "Could not refresh the lobbies' panels", error );
            } );
        } );
    }

    /**
     * Function createLobby() :: Make a team lobby - its category, the voice channel in it, and the
     * panel channel below that.
     *
     * A lobby is one of the server's setups, as a generator and a pool are, and spends the allowance
     * as they do - which whatever offers to make one asks first, as it does for them.
     */
    public async createLobby( args: {
        guild: Guild;
        userOwnerId: string;
        hostRoleIds?: string[];
    } ): Promise<ITeamLobbyCreateSuccess | ITeamLobbyRefusal> {
        const { guild, userOwnerId, hostRoleIds = [] } = args;

        const naming = getNaming();

        const category = await CategoryManager.$.create( {
            guild,
            name: naming.lobbyChannelsCategoryName
        } ).catch( ( error: Error ) => {
            this.logger.error( this.createLobby, `Guild id: '${ guild.id }' - Could not create the lobby's category`, error );

            return null;
        } );

        if ( ! category ) {
            return { code: TEAM_LOBBY_REFUSALS.FAILED };
        }

        const created = await this.services.channelService.create( {
            guild,
            parent: category,
            name: naming.lobbyChannelName,
            userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_LOBBY_CHANNEL,
            version: VERSION_LOBBY_CHANNEL_UI_V1,
            type: ChannelType.GuildVoice,
            permissionOverwrites: this.getLobbyPermissions( guild, category )
        } );

        if ( ! created ) {
            await category.delete().catch( ( error: Error ) => {
                this.logger.error( this.createLobby, `Guild id: '${ guild.id }' - Could not remove the lobby's category`, error );
            } );

            return { code: TEAM_LOBBY_REFUSALS.FAILED };
        }

        const lobbyDB = await created.db;

        await LobbyChannelDataModel.$.setLobbySettings( lobbyDB.id, { lobbyHostRoleIds: hostRoleIds } );

        await this.refreshPanel( created.channel as unknown as VoiceChannel );

        this.logger.admin(
            this.createLobby,
            `🎮  Team lobby has been created - "${ created.channel.name }" (${ guild.name }) (${ guild.memberCount })`
        );

        return { code: "success", lobby: created.channel as unknown as VoiceChannel, lobbyDB };
    }

    /**
     * Function handleCreateLobbySetup() :: Make the team lobby the dashboard asked for.
     *
     * The api has held the request to the allowance before sending it, as it does a pool's.
     */
    public async handleCreateLobbySetup( data: CreateLobbySetupPayload ) {
        const { guildId, userOwnerId } = data;

        const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

        if ( ! guild ) {
            this.logger.error( this.handleCreateLobbySetup, `Guild id: '${ guildId }' - Guild not found` );

            return;
        }

        const result = await this.createLobby( { guild, userOwnerId } );

        if ( "success" !== result.code ) {
            this.logger.error( this.handleCreateLobbySetup, `Guild id: '${ guildId }' - Could not create the lobby: '${ result.code }'` );
        }
    }

    /**
     * Function handleDeleteLobbySetup() :: Delete the team lobby the dashboard asked to, with its rooms.
     */
    public async handleDeleteLobbySetup( data: DeleteLobbySetupPayload ) {
        const { guildId, masterChannelId } = data;

        this.logger.log( this.handleDeleteLobbySetup, `Guild id: '${ guildId }' - Deleting lobby '${ masterChannelId }'` );

        await this.services.channelCleanupService.deleteLobbyMasterChannelWithCleanup( { guildId, masterChannelId } );
    }

    /**
     * Function canControl() :: Whether this member may split the lobby and call it back.
     *
     * The server's admins always may - whoever could set the lobby up. Past them, a lobby naming host
     * roles is controlled by those roles alone, and one naming none by whoever is in it, or in one of
     * its rooms - the room a split put them in is still the lobby's.
     */
    public async canControl( lobby: VoiceChannel, member: GuildMember ): Promise<boolean> {
        if ( member.id === lobby.guild.ownerId || member.permissions.has( DEFAULT_SETUP_PERMISSIONS ) ) {
            return true;
        }

        const lobbyDB = await ChannelModel.$.getByChannelId( lobby.id );

        if ( ! lobbyDB?.isLobbyMaster ) {
            return false;
        }

        const hostRoleIds = ( await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id ) )?.lobbyHostRoleIds ?? [];

        if ( hostRoleIds.length ) {
            return hostRoleIds.some( ( roleId ) => member.roles.cache.has( roleId ) );
        }

        const voiceChannelId = member.voice.channelId;

        if ( ! voiceChannelId ) {
            return false;
        }

        if ( voiceChannelId === lobby.id ) {
            return true;
        }

        const rooms = await ChannelModel.$.getLobbyRoomsByLobbyId( lobby.guild.id, lobby.id );

        return rooms.some( ( room ) => room.channelId === voiceChannelId );
    }

    /**
     * Function getSplitAccessRefusal() :: Why this member could not split the lobby now, before they
     * pick how - or null when nothing stands in the way.
     *
     * Asked again when they have picked, since anything here can change in between.
     */
    public async getSplitAccessRefusal( lobby: VoiceChannel, member: GuildMember ): Promise<ITeamLobbyRefusal | null> {
        const lobbyDB = await ChannelModel.$.getByChannelId( lobby.id );

        // Asked first, as a generator asks it first: a lobby past the allowance splits for nobody, so
        // any other reason would be true of it and beside the point.
        if ( lobbyDB && ! await this.services.entitlementService.isMasterChannelCovered( lobby.guild.id, lobbyDB.id ) ) {
            return { code: TEAM_LOBBY_REFUSALS.NOT_COVERED };
        }

        if ( ! await this.canControl( lobby, member ) ) {
            return { code: TEAM_LOBBY_REFUSALS.NOT_HOST };
        }

        const missingPermissions = this.getMissingBotPermissions( lobby );

        if ( missingPermissions.length ) {
            return { code: TEAM_LOBBY_REFUSALS.MISSING_PERMISSIONS, missingPermissions };
        }

        if ( await ChannelModel.$.getLobbyRoomsCountByLobbyId( lobby.guild.id, lobby.id ) > 0 ) {
            return { code: TEAM_LOBBY_REFUSALS.ALREADY_SPLIT };
        }

        return null;
    }

    /**
     * Function setHostRoles() :: Name the roles that run a lobby - none, for anyone in it.
     */
    public async setHostRoles( guild: Guild, lobbyDB: ChannelExtended, hostRoleIds: string[] ) {
        await LobbyChannelDataModel.$.setLobbySettings( lobbyDB.id, { lobbyHostRoleIds: hostRoleIds } );

        const lobby = guild.channels.cache.get( lobbyDB.channelId );

        if ( lobby?.type === ChannelType.GuildVoice ) {
            await this.refreshPanel( lobby );
        }
    }

    /**
     * Function getPanelArgs() :: What the lobby's panel shows - the lobby to join, the rooms it is split
     * into, and who runs it.
     *
     * Read off the lobby every time rather than kept, so a panel drawn after a restart says the same
     * as one drawn before it.
     */
    public async getPanelArgs( lobby: VoiceChannel ) {
        const lobbyDB = await ChannelModel.$.getByChannelId( lobby.id );

        if ( ! lobbyDB?.isLobbyMaster ) {
            return { lobbyId: lobby.id, roomIds: [], hostRoleIds: [] };
        }

        const roomsDB = await ChannelModel.$.getLobbyRoomsByLobbyId( lobby.guild.id, lobby.id, false ),
            settings = await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id );

        return {
            lobbyId: lobby.id,
            roomIds: roomsDB.map( ( roomDB ) => roomDB.channelId ),
            hostRoleIds: settings?.lobbyHostRoleIds ?? []
        };
    }

    /**
     * Function refreshPanel() :: Draw the lobby's panel again, in its panel channel - posting it anew
     * when the one it had is gone, and making the channel again when that is.
     *
     * Never throws: it is the last thing a split or a call back does, after members have already been
     * moved, and a panel discord would not redraw must not turn that into a press that failed.
     */
    public async refreshPanel( lobby: VoiceChannel ) {
        await this.drawPanel( lobby ).catch( ( error ) => {
            this.logger.error( this.refreshPanel, `Guild id: '${ lobby.guild.id }' - Could not draw the panel of lobby '${ lobby.id }'`, error );
        } );
    }

    /**
     * Function refreshPanels() :: Draw every lobby's panel again as the bot starts, as generators'
     * control panels are - so a panel shows what this version of the bot draws, in the server's
     * language, and a lobby whose panel channel went while the bot was away gets it back.
     *
     * A panel that would come out as it was last drawn is left alone, so a restart edits only what
     * changed. Only the lobbies of the guilds this shard holds - each shard draws its own.
     */
    private async refreshPanels() {
        const client = this.services.appService.getClient();

        const lobbiesDB = await ChannelModel.$.findMany(
            { where: { internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_LOBBY_CHANNEL } },
            false
        );

        let drawn = 0;

        for ( const lobbyDB of lobbiesDB ) {
            const guild = client.guilds.cache.get( lobbyDB.guildId );

            if ( ! guild || ! ownsGuild( guild.id ) ) {
                continue;
            }

            const lobby = guild.channels.cache.get( lobbyDB.channelId );

            if ( lobby?.type !== ChannelType.GuildVoice ) {
                continue;
            }

            const isDrawn = await this.chain( lobby.id, () => this.drawPanel( lobby, true ) ).catch( ( error ) => {
                this.logger.error( this.refreshPanels, `Guild id: '${ guild.id }' - Could not redraw the panel of lobby '${ lobby.id }'`, error );

                return false;
            } );

            if ( isDrawn ) {
                drawn++;
            }
        }

        this.logger.info( this.refreshPanels, `Redrew '${ drawn }' of '${ lobbiesDB.length }' lobby panel(s)` );
    }

    /**
     * Function drawPanel() :: Draw a lobby's panel where it is shown - its panel channel and its own
     * chat - and say whether anything was drawn.
     *
     * The drawing is worked out in memory first, as a generator's control panel's is, and stored as a
     * hash. `skipUnchanged` - the restart's pass - leaves a panel alone when that hash is the one it
     * was last drawn with; anything else redraws regardless, so a press that changed nothing still
     * puts back a panel somebody deleted by hand.
     */
    private async drawPanel( lobby: VoiceChannel, skipUnchanged = false ): Promise<boolean> {
        const lobbyDB = await ChannelModel.$.getByChannelId( lobby.id );

        const adapter = this.services.uiService.get( "VertixBot/UI-V3/TeamLobbyAdapter" );

        if ( ! lobbyDB?.isLobbyMaster || ! adapter ) {
            return false;
        }

        const settings = await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id );

        const standing = settings?.lobbyPanelChannelId
            ? await ChannelUtils.cacheOrFetchChannel( lobby.guild, settings.lobbyPanelChannelId )
            : null;

        // A panel is the only way to run a lobby, so a channel deleted by hand is made again rather than
        // left missing - and a channel made again holds no panel yet.
        const panelChannel = standing?.type === ChannelType.GuildText
            ? standing
            : await this.openPanelChannel( lobby, lobbyDB );

        // Each place is drawn whatever became of the other - a panel channel discord would not let
        // the bot write in still leaves the lobby's own chat with its panel.
        const inChannel = panelChannel
            ? await this.drawPanelIn( adapter, panelChannel, {
                messageId: panelChannel === standing ? settings?.lobbyPanelMessageId : null,
                hash: settings?.lobbyPanelMessageHash
            }, skipUnchanged )
            : null;

        const inChat = await this.drawPanelIn( adapter, lobby, {
            messageId: settings?.lobbyChatPanelMessageId,
            hash: settings?.lobbyChatPanelMessageHash
        }, skipUnchanged );

        const changes = {
            ... ( inChannel && (
                inChannel.messageId !== settings?.lobbyPanelMessageId || inChannel.hash !== settings?.lobbyPanelMessageHash
            ) ? { lobbyPanelMessageId: inChannel.messageId, lobbyPanelMessageHash: inChannel.hash } : {} ),
            ... ( inChat && (
                inChat.messageId !== settings?.lobbyChatPanelMessageId || inChat.hash !== settings?.lobbyChatPanelMessageHash
            ) ? { lobbyChatPanelMessageId: inChat.messageId, lobbyChatPanelMessageHash: inChat.hash } : {} )
        };

        if ( Object.keys( changes ).length ) {
            await LobbyChannelDataModel.$.setLobbySettings( lobbyDB.id, changes );
        }

        return !! ( inChannel?.isDrawn || inChat?.isDrawn );
    }

    /**
     * Function drawPanelIn() :: Draw the panel in one place, editing the one already there - and say
     * which message holds it now, and what it shows.
     *
     * Null when nothing could be drawn there. A panel posted before the panel became a container is
     * replaced rather than edited: an edit keeps a message's embeds, and discord takes no container
     * on a message that still has them.
     */
    private async drawPanelIn(
        adapter: NonNullable<ReturnType<UIService[ "get" ]>>,
        channel: TextChannel | VoiceChannel,
        stored: { messageId?: string | null; hash?: string | null },
        skipUnchanged: boolean
    ): Promise<{ messageId: string; hash: string; isDrawn: boolean } | null> {
        try {
            const drawing = await adapter.render( channel ),
                hash = this.getPanelHash( channel.id, drawing );

            if ( skipUnchanged && stored.messageId && hash === stored.hash ) {
                return { messageId: stored.messageId, hash, isDrawn: false };
            }

            let message = stored.messageId
                ? await channel.messages.fetch( stored.messageId ).catch( () => null )
                : null;

            const isContainer = MessageFlags.IsComponentsV2 === drawing.flags;

            if ( message && isContainer && ! message.flags?.has( MessageFlags.IsComponentsV2 ) ) {
                await message.delete().catch( () => null );

                message = null;
            }

            if ( message ) {
                await adapter.rerenderMessage( message );

                return { messageId: message.id, hash, isDrawn: true };
            }

            const sent = await adapter.send( channel );

            return sent ? { messageId: sent.id, hash, isDrawn: true } : null;
        } catch( error ) {
            this.logger.error( this.drawPanelIn, `Guild id: '${ channel.guild.id }' - Could not draw a lobby panel in '${ channel.id }'`, error );

            return null;
        }
    }

    /**
     * Function getPanelHash() :: A panel's drawing, reduced to something that can be stored and
     * compared - with the channel in it, so a panel only counts as unchanged where it was drawn.
     */
    private getPanelHash( panelChannelId: string, drawing: unknown ) {
        return crypto
            .createHash( LOBBY_PANEL_HASH_ALGORITHM )
            .update( panelChannelId )
            .update( JSON.stringify( drawing ) )
            .digest( "hex" );
    }

    /**
     * Function openPanelChannel() :: Make the text channel a lobby's panel is posted in, beside the lobby
     * in its category - as a generator makes its control panel's - and remember it on the lobby.
     *
     * Its row names the lobby as its owner, the way a control panel's names its generator, and that is
     * how a press on the panel finds the lobby - so the row is written before anything is posted in it.
     */
    private async openPanelChannel( lobby: VoiceChannel, lobbyDB: ChannelExtended ): Promise<TextChannel | null> {
        const { guild } = lobby;

        const created = await this.services.channelService.create( {
            guild,
            parent: lobby.parent ?? undefined,
            name: getNaming().lobbyControlPanelName,
            userOwnerId: lobbyDB.userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DEFAULT_CHANNEL,
            ownerChannelId: lobby.id,
            version: VERSION_LOBBY_CHANNEL_UI_V1,
            type: ChannelType.GuildText,
            position: lobby.position + 1,
            permissionOverwrites: this.getPanelChannelPermissions( lobby )
        } );

        if ( ! created ) {
            this.logger.error( this.openPanelChannel, `Guild id: '${ guild.id }' - Could not make the panel channel of lobby '${ lobby.id }'` );

            return null;
        }

        await created.db;

        await LobbyChannelDataModel.$.setLobbySettings( lobbyDB.id, { lobbyPanelChannelId: created.channel.id } );

        return created.channel as TextChannel;
    }

    /**
     * Function getLobbyByPanelChannel() :: The lobby a panel runs, from the channel the panel is in -
     * or null when the lobby is gone.
     *
     * A panel is in two places: the panel channel, whose row names the lobby as its owner, and the
     * lobby's own chat, which is the lobby.
     */
    public async getLobbyByPanelChannel( channel: { id: string; guild: Guild } ): Promise<VoiceChannel | null> {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        const lobbyId = channelDB?.isLobbyMaster ? channel.id : channelDB?.ownerChannelId;

        const lobby = lobbyId ? channel.guild.channels.cache.get( lobbyId ) : null;

        return lobby?.type === ChannelType.GuildVoice ? lobby : null;
    }

    /**
     * Function split() :: Split the lobby, as this member asked.
     */
    public async split( args: ITeamLobbySplitArgs ): Promise<ITeamLobbySplitSuccess | ITeamLobbyRefusal> {
        return this.chain( args.lobby.id, () => this.splitNow( args ) );
    }

    /**
     * Function recall() :: Call everyone back from the lobby's rooms, and close them.
     *
     * Asked of nothing but who is asking: a lobby that fell past the allowance mid-split still gets
     * its members back, which is the one thing nobody should be left needing a plan for.
     */
    public async recall( args: ITeamLobbyRecallArgs ): Promise<ITeamLobbyRecallSuccess | ITeamLobbyRefusal> {
        return this.chain( args.lobby.id, () => this.recallNow( args ) );
    }

    /**
     * Function getSplitPlanRefusal() :: Why a split asked for this way could not be made with whoever is
     * in the lobby now - or null when it could.
     *
     * What a screen asks before it lets a split be applied, so nobody is offered one that is bound to
     * be refused - and what the split asks again, since the lobby can change between the two.
     */
    public async getSplitPlanRefusal(
        lobby: VoiceChannel,
        mode: TTeamLobbySplitMode,
        count: number,
        playerIds: string[] = []
    ): Promise<ITeamLobbyRefusal | null> {
        const prepared = await this.prepareSplit( lobby, mode, count, playerIds );

        return "refusal" in prepared ? prepared.refusal : null;
    }

    /**
     * Function prepareSplit() :: Who a split is for and how many rooms it opens - or why it cannot be
     * made: a number it does not take, nobody to split, too few people for the number asked, or more
     * rooms than one setup may have open.
     *
     * Too few is fewer people than teams, or than one group's size - a team of nobody is not a team,
     * and a group never filled is not the group asked for. Picked teams are neither: their rooms open
     * empty, and fill as members walk in.
     */
    private async prepareSplit(
        lobby: VoiceChannel,
        mode: TTeamLobbySplitMode,
        count: number,
        playerIds: string[]
    ): Promise<TPreparedSplit> {
        if ( ! TeamLobbySplitPlanner.$.isValidCount( mode, count ) ) {
            return { refusal: { code: TEAM_LOBBY_REFUSALS.INVALID_COUNT } };
        }

        const request = { mode, count, memberIds: this.getMemberIdsToSplit( lobby, mode, playerIds ) };

        if ( TEAM_LOBBY_SPLIT_MODES.PICK_TEAMS === mode ) {
            return { request };
        }

        if ( ! request.memberIds.length ) {
            return { refusal: { code: TEAM_LOBBY_REFUSALS.NOBODY_TO_SPLIT } };
        }

        if ( request.memberIds.length < count ) {
            return { refusal: { code: TEAM_LOBBY_REFUSALS.TOO_FEW_MEMBERS } };
        }

        const roomsCount = TeamLobbySplitPlanner.$.countRooms( request ),
            roomsLimit = ( await GuildDataManager.$.getAllSettings( lobby.guild.id ) ).maxActiveDynamicChannels;

        if ( roomsCount > roomsLimit ) {
            return { refusal: { code: TEAM_LOBBY_REFUSALS.TOO_MANY_ROOMS, roomsLimit } };
        }

        return { request };
    }

    private async splitNow( args: ITeamLobbySplitArgs ): Promise<ITeamLobbySplitSuccess | ITeamLobbyRefusal> {
        const { lobby, member, mode, count } = args,
            { guild } = lobby;

        if ( ! TeamLobbySplitPlanner.$.isValidCount( mode, count ) ) {
            return { code: TEAM_LOBBY_REFUSALS.INVALID_COUNT };
        }

        const refusal = await this.getSplitAccessRefusal( lobby, member );

        if ( refusal ) {
            return refusal;
        }

        const { playerIds = [] } = args,
            prepared = await this.prepareSplit( lobby, mode, count, playerIds );

        if ( "refusal" in prepared ) {
            return prepared.refusal;
        }

        const { request } = prepared;

        const lobbyDB = await ChannelModel.$.getByChannelId( lobby.id );

        if ( ! lobbyDB?.isLobbyMaster ) {
            return { code: TEAM_LOBBY_REFUSALS.FAILED };
        }

        const plan = TeamLobbySplitPlanner.$.plan( request, this.getRoomNaming() );

        const rooms = await this.openRooms( lobby, lobbyDB, member, mode, plan, playerIds.length ? request.memberIds : [] );

        if ( ! rooms ) {
            return { code: TEAM_LOBBY_REFUSALS.FAILED };
        }

        const { closedRoomIds, ... tally } = await this.moveIn( lobby, rooms, plan );

        if ( closedRoomIds.length === rooms.length ) {
            await this.endSession( guild, lobby.id, closedRoomIds );
        }

        await this.refreshPanel( lobby );

        const openRooms = rooms.filter( ( room ) => ! closedRoomIds.includes( room.id ) );

        this.logger.info(
            this.splitNow,
            `Guild id: '${ guild.id }' - Lobby '${ lobby.id }' split '${ mode }' by '${ member.id }' into ` +
                `'${ openRooms.length }' room(s), moved '${ tally.moved }', missed '${ tally.missed }'`
        );

        return { code: "success", rooms: openRooms, ... tally };
    }

    private async recallNow( args: ITeamLobbyRecallArgs ): Promise<ITeamLobbyRecallSuccess | ITeamLobbyRefusal> {
        const { lobby, member } = args,
            { guild } = lobby;

        if ( ! await this.canControl( lobby, member ) ) {
            return { code: TEAM_LOBBY_REFUSALS.NOT_HOST };
        }

        const roomsDB = await ChannelModel.$.getLobbyRoomsByLobbyId( guild.id, lobby.id, false );

        if ( ! roomsDB.length ) {
            return { code: TEAM_LOBBY_REFUSALS.NOT_SPLIT };
        }

        const missingPermissions = this.getMissingBotPermissions( lobby );

        if ( missingPermissions.length ) {
            return { code: TEAM_LOBBY_REFUSALS.MISSING_PERMISSIONS, missingPermissions };
        }

        const tally: IMoveTally = { moved: 0, missed: 0 };

        for ( const roomDB of roomsDB ) {
            const room = guild.channels.cache.get( roomDB.channelId );

            if ( room?.isVoiceBased() ) {
                for ( const roomMember of [ ... room.members.values() ] ) {
                    if ( await this.move( roomMember, lobby ) ) {
                        tally.moved++;
                    } else {
                        tally.missed++;
                    }
                }
            }

            await this.closeRoom( guild, roomDB.channelId );
        }

        await this.endSession( guild, lobby.id, roomsDB.map( ( roomDB ) => roomDB.channelId ) );

        await this.refreshPanel( lobby );

        this.logger.info(
            this.recallNow,
            `Guild id: '${ guild.id }' - Lobby '${ lobby.id }' called back by '${ member.id }', ` +
                `'${ roomsDB.length }' room(s) closed, moved '${ tally.moved }', missed '${ tally.missed }'`
        );

        return { code: "success", ... tally };
    }

    /**
     * Function onLeave() :: Somebody left a voice channel - if it was the last of a lobby and its
     * rooms, the split is over.
     */
    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;

        if ( ! oldState.channelId ) {
            return;
        }

        await this.redrawWatchers( oldState.channelId );

        const lobbyId = this.getLobbyIdOf( await ChannelModel.$.getByChannelId( oldState.channelId ) );

        if ( ! lobbyId ) {
            return;
        }

        await this.chain( lobbyId, () => this.closeSplitIfAbandoned( oldState.guild, lobbyId ) );
    }

    /**
     * Function getLobbyIdOf() :: The lobby a channel belongs to - itself for a lobby, its lobby for one
     * of its rooms, and none for anything else.
     */
    private getLobbyIdOf( channelDB: ChannelExtended | null | undefined ) {
        if ( channelDB?.isLobbyMaster ) {
            return channelDB.channelId;
        }

        if ( channelDB?.isLobbyRoom ) {
            return channelDB.ownerChannelId;
        }

        return null;
    }

    /**
     * Function onChannelGuildVoiceDelete() :: A voice channel was deleted by hand - if it was a lobby,
     * its rooms go with it; if it was a lobby's room, its row does.
     */
    private async onChannelGuildVoiceDelete( channel: VoiceChannel ) {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        const { guild } = channel;

        if ( channelDB?.isLobbyRoom && channelDB.ownerChannelId ) {
            const lobbyId = channelDB.ownerChannelId;

            await this.chain( lobbyId, async() => {
                await ChannelModel.$.delete( { channelId: channel.id } );

                // The last of a split's rooms gone by hand is the split gone, its category with it.
                if ( 0 === await ChannelModel.$.getLobbyRoomsCountByLobbyId( guild.id, lobbyId ) ) {
                    await this.endSession( guild, lobbyId, [ channel.id ] );
                }

                const lobby = guild.channels.cache.get( lobbyId );

                if ( lobby?.type === ChannelType.GuildVoice ) {
                    await this.refreshPanel( lobby );
                }
            } );

            return;
        }

        if ( ! channelDB?.isLobbyMaster ) {
            return;
        }

        await this.chain( channel.id, async() => {
            const roomsDB = await ChannelModel.$.getLobbyRoomsByLobbyId( guild.id, channel.id, false );

            for ( const roomDB of roomsDB ) {
                await this.closeRoom( guild, roomDB.channelId );
            }

            await this.endSession( guild, channel.id, roomsDB.map( ( roomDB ) => roomDB.channelId ) );

            // A panel for a lobby that is gone has nothing left to run.
            const panelChannelId = ( await LobbyChannelDataModel.$.getLobbySettings( channelDB.id ) )?.lobbyPanelChannelId,
                panelChannel = panelChannelId ? guild.channels.cache.get( panelChannelId ) : null;

            if ( panelChannel && ! panelChannel.isThread() ) {
                await this.services.channelService.delete( { guild, channel: panelChannel } );
            }

            await ChannelModel.$.delete( { channelId: channel.id } );
        } );
    }

    /**
     * Function closeAbandonedSplits() :: Close the splits nobody was left in while the bot was away.
     *
     * Nothing announces a member who left while the bot was down, so a split everybody walked out of
     * then would otherwise stand until somebody came back and called it.
     */
    private async closeAbandonedSplits() {
        const client = this.services.appService.getClient();

        const roomsDB = await ChannelModel.$.findMany(
            { where: { internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.LOBBY_ROOM_CHANNEL } },
            false
        );

        const lobbies = new Map<string, Guild>();

        for ( const roomDB of roomsDB ) {
            const guild = client.guilds.cache.get( roomDB.guildId );

            if ( guild && roomDB.ownerChannelId && ownsGuild( guild.id ) ) {
                lobbies.set( roomDB.ownerChannelId, guild );
            }
        }

        for ( const [ lobbyId, guild ] of lobbies ) {
            await this.chain( lobbyId, () => this.closeSplitIfAbandoned( guild, lobbyId ) );
        }
    }

    /**
     * Function closeSplitIfAbandoned() :: Close every room of a lobby nobody is in any more - nobody in
     * the lobby, and nobody in any of its rooms.
     */
    private async closeSplitIfAbandoned( guild: Guild, lobbyId: string ) {
        const roomsDB = await ChannelModel.$.getLobbyRoomsByLobbyId( guild.id, lobbyId, false );

        if ( ! roomsDB.length ) {
            return;
        }

        const channelIds = [ lobbyId, ... roomsDB.map( ( roomDB ) => roomDB.channelId ) ];

        const isAnybodyLeft = channelIds.some( ( channelId ) => {
            const channel = guild.channels.cache.get( channelId );

            return !! channel?.isVoiceBased() && channel.members.some( ( member ) => ! member.user.bot );
        } );

        if ( isAnybodyLeft ) {
            return;
        }

        for ( const roomDB of roomsDB ) {
            await this.closeRoom( guild, roomDB.channelId );
        }

        await this.endSession( guild, lobbyId, roomsDB.map( ( roomDB ) => roomDB.channelId ) );

        const lobby = guild.channels.cache.get( lobbyId );

        if ( lobby?.type === ChannelType.GuildVoice ) {
            await this.refreshPanel( lobby );
        }

        this.logger.info(
            this.closeSplitIfAbandoned,
            `Guild id: '${ guild.id }' - Lobby '${ lobbyId }' was left empty, '${ roomsDB.length }' room(s) closed`
        );
    }

    /**
     * Function openRooms() :: Open a split's rooms, in order, in a category of the split's own - each
     * written down before anybody is moved, since a member moved into a room the bot has no row for yet
     * is a member nobody can count.
     *
     * All of them or none: a split that came out with some of its rooms is called back by nobody,
     * since the rooms it did open are not the split anybody asked for.
     */
    /**
     * Function openRooms() :: Open a split's rooms in a category of the split's own.
     *
     * `pickedIds` are the members a split of picked teams was kept to, none when it is for the whole
     * lobby - their rooms then open to them alone.
     */
    private async openRooms(
        lobby: VoiceChannel,
        lobbyDB: ChannelExtended,
        member: GuildMember,
        mode: TTeamLobbySplitMode,
        plan: ITeamLobbyRoomPlan[],
        pickedIds: string[]
    ) {
        // A category left from a split whose rooms all went while the bot was away, with nothing in it.
        await this.endSession( lobby.guild, lobby.id, [] );

        const category = await this.openSessionCategory( lobby );

        if ( ! category ) {
            return null;
        }

        await LobbyChannelDataModel.$.setLobbySettings( lobbyDB.id, { lobbySessionCategoryId: category.id, lobbySplitMode: mode } );

        const hostRoleIds = ( await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id ) )?.lobbyHostRoleIds ?? [];

        const rooms: VoiceChannel[] = [];

        for ( const roomPlan of plan ) {
            const created = await this.services.channelService.create( {
                guild: lobby.guild,
                parent: category,
                name: roomPlan.name,
                userLimit: roomPlan.userLimit,
                bitrate: lobby.bitrate,
                ... ( lobby.rtcRegion ? { rtcRegion: lobby.rtcRegion } : {} ),
                userOwnerId: member.id,
                ownerChannelId: lobby.id,
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.LOBBY_ROOM_CHANNEL,
                version: VERSION_LOBBY_CHANNEL_UI_V1,
                type: ChannelType.GuildVoice,
                // Picked teams open their rooms to the whole lobby - or to the members picked for the
                // split - and close the others on whoever walks in; dealt ones are shut to all but the
                // members dealt into them from the start.
                permissionOverwrites: TEAM_LOBBY_SPLIT_MODES.PICK_TEAMS !== mode
                    ? this.getTeamRoomPermissions( lobby, roomPlan.memberIds, hostRoleIds )
                    : pickedIds.length
                        ? this.getTeamRoomPermissions( lobby, pickedIds, hostRoleIds )
                        : this.getRoomPermissions( lobby )
            } );

            if ( ! created ) {
                for ( const room of rooms ) {
                    await this.closeRoom( lobby.guild, room.id );
                }

                await this.endSession( lobby.guild, lobby.id, rooms.map( ( room ) => room.id ) );

                return null;
            }

            await created.db;

            rooms.push( created.channel as unknown as VoiceChannel );
        }

        return rooms;
    }

    /**
     * Function moveIn() :: Move each member to the room planned for them.
     *
     * Only from the lobby: a member who walked off while the rooms were being opened is not fetched
     * back from wherever they went. A room nobody could be moved into is closed again rather than left
     * standing empty for a team that is not coming.
     */
    private async moveIn( lobby: VoiceChannel, rooms: VoiceChannel[], plan: ITeamLobbyRoomPlan[] ) {
        const tally: IMoveTally = { moved: 0, missed: 0 },
            closedRoomIds: string[] = [];

        for ( const [ index, room ] of rooms.entries() ) {
            const { memberIds } = plan[ index ];

            let movedHere = 0;

            for ( const memberId of memberIds ) {
                const member = lobby.members.get( memberId );

                if ( member && await this.move( member, room ) ) {
                    tally.moved++;
                    movedHere++;
                } else {
                    tally.missed++;
                }
            }

            if ( memberIds.length && ! movedHere ) {
                await this.closeRoom( lobby.guild, room.id );

                closedRoomIds.push( room.id );
            }
        }

        return { ... tally, closedRoomIds };
    }

    private async move( member: GuildMember, channel: VoiceChannel ) {
        return member.voice.setChannel( channel ).then( () => true ).catch( ( error: Error ) => {
            this.logger.warn(
                this.move,
                `Guild id: '${ member.guild.id }' - Could not move '${ member.id }' to '${ channel.id }': ${ error.message }`
            );

            return false;
        } );
    }

    /**
     * Function openSessionCategory() :: The category a split's rooms open in, put right below the
     * lobby's own.
     *
     * Given the rooms' own permissions, so it is seen by the same people they are. Moved into place once
     * made rather than created in place: a position asked for at creation can tie with a category
     * already standing there, and a tie goes to the older of the two.
     */
    private async openSessionCategory( lobby: VoiceChannel ) {
        const category = await CategoryManager.$.create( {
            guild: lobby.guild,
            name: getNaming().lobbySessionCategoryName.replace( VAR_TEAM_LOBBY_NAME, lobby.name ),
            permissionOverwrites: this.getRoomPermissions( lobby )
        } ).catch( ( error: Error ) => {
            this.logger.error( this.openSessionCategory, `Guild id: '${ lobby.guild.id }' - Could not open a category for lobby '${ lobby.id }'`, error );

            return null;
        } );

        if ( category && lobby.parent ) {
            await category.setPosition( lobby.parent.position + 1 ).catch( ( error: Error ) => {
                this.logger.warn( this.openSessionCategory, `Guild id: '${ lobby.guild.id }' - Could not move category '${ category.id }' below the lobby's: ${ error.message }` );
            } );
        }

        return category;
    }

    /**
     * Function endSession() :: Take down the category a split's rooms were in, once they are closed -
     * and forget it either way.
     *
     * Kept, rather than taken down, when anything besides those rooms has been put in it since: a
     * channel somebody moved there is theirs, not the split's.
     */
    private async endSession( guild: Guild, lobbyId: string, closedRoomIds: readonly string[] ) {
        const lobbyDB = await ChannelModel.$.getByChannelId( lobbyId );

        if ( ! lobbyDB?.isLobbyMaster ) {
            return;
        }

        const categoryId = ( await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id ) )?.lobbySessionCategoryId;

        if ( ! categoryId ) {
            return;
        }

        await ChannelUtils.deleteCategoryUnlessUsed(
            guild.channels.cache.get( categoryId ),
            guild,
            closedRoomIds,
            this.logger,
            this.endSession
        );

        await LobbyChannelDataModel.$.setLobbySettings( lobbyDB.id, { lobbySessionCategoryId: null, lobbySplitMode: null } );
    }

    /**
     * Function closeRoom() :: Close one of a lobby's rooms - in discord and in the database, or only in
     * the database when discord no longer has it.
     */
    private async closeRoom( guild: Guild, channelId: string ) {
        const room = guild.channels.cache.get( channelId );

        if ( room && ! room.isThread() ) {
            await this.services.channelService.delete( { guild, channel: room } );

            return;
        }

        await ChannelModel.$.delete( { channelId } );
    }

    /**
     * Function getMemberIdsToSplit() :: Who a split is for - everybody in the lobby, or only the members
     * picked for it.
     *
     * Bots are never split. A dealt split takes the picked members who are in the lobby, since only
     * they can be moved; picked teams take every member picked, who walk into their rooms themselves.
     */
    private getMemberIdsToSplit( lobby: VoiceChannel, mode: TTeamLobbySplitMode, playerIds: string[] ) {
        const inLobby = [ ... lobby.members.values() ]
            .filter( ( member ) => ! member.user.bot )
            .map( ( member ) => member.id );

        if ( ! playerIds.length ) {
            return inLobby;
        }

        const picked = playerIds.filter( ( playerId ) => ! lobby.guild.members.cache.get( playerId )?.user.bot );

        return TEAM_LOBBY_SPLIT_MODES.PICK_TEAMS === mode
            ? picked
            : inLobby.filter( ( memberId ) => picked.includes( memberId ) );
    }

    private getMissingBotPermissions( lobby: VoiceChannel ) {
        return PermissionsManager.$.getMissingChannelPermissionsForBot(
            lobby,
            new PermissionsBitField( TEAM_LOBBY_BOT_PERMISSIONS )
        );
    }

    private getRoomNaming(): ITeamLobbyRoomNaming {
        const naming = getNaming();

        return {
            teamRoomName: naming.lobbyTeamRoomName,
            teamRoomColors: naming.lobbyTeamRoomColors,
            groupRoomName: naming.lobbyGroupRoomName
        };
    }

    /**
     * Function getLobbyPermissions() :: The overwrites a lobby is created with - its category's, with
     * the bot granted what it needs to run it on top.
     */
    private getLobbyPermissions( guild: Guild, category: CategoryChannel ): OverwriteResolvable[] {
        return PermissionsManager.$.mergeChannelPermissionOverwrites(
            [ ... category.permissionOverwrites.cache.values() ],
            [ { id: guild.client.user.id, ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS } ]
        );
    }

    /**
     * Function getPanelChannelPermissions() :: The overwrites a lobby's panel channel is created with.
     *
     * Shown to whoever can see the lobby, and written in by nobody but the bot - the shape a generator's
     * control panel has. Only who may see is carried over from the lobby: a role the lobby lets speak
     * would otherwise be let chat under the panel too.
     */
    private getPanelChannelPermissions( lobby: VoiceChannel ): OverwriteResolvable[] {
        const { guild } = lobby,
            everyoneId = guild.roles.everyone.id,
            botId = guild.client.user.id,
            everyoneSees = !! lobby.permissionsFor( everyoneId )?.has( PermissionsBitField.Flags.ViewChannel );

        return [
            {
                id: everyoneId,
                allow: everyoneSees ? PermissionsBitField.Flags.ViewChannel : 0n,
                deny: ( everyoneSees ? 0n : PermissionsBitField.Flags.ViewChannel ) | DEFAULT_CONTROL_PANEL_DENY_PERMISSIONS
            },
            {
                id: botId,
                ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS
            },
            ... [ ... lobby.permissionOverwrites.cache.values() ]
                .filter( ( overwrite ) => everyoneId !== overwrite.id && botId !== overwrite.id )
                .filter( ( overwrite ) =>
                    overwrite.allow.has( PermissionsBitField.Flags.ViewChannel ) ||
                    overwrite.deny.has( PermissionsBitField.Flags.ViewChannel )
                )
                .map( ( overwrite ) => ( {
                    id: overwrite.id,
                    type: overwrite.type,
                    allow: overwrite.allow.has( PermissionsBitField.Flags.ViewChannel ) ? PermissionsBitField.Flags.ViewChannel : 0n,
                    deny: overwrite.deny.has( PermissionsBitField.Flags.ViewChannel ) ? PermissionsBitField.Flags.ViewChannel : 0n
                } ) )
        ];
    }

    /**
     * Function getTeamRoomPermissions() :: The overwrites a dealt room is made with - shut to everybody
     * but the members dealt into it and the lobby's hosts, so nobody walks into another team's room, or
     * reads its chat, and takes what they learn back to their own.
     *
     * Everything else the lobby says is kept. Seeing and joining are taken out of every entry it has,
     * since a role it lets in would otherwise let every member holding it into every room.
     */
    private getTeamRoomPermissions( lobby: VoiceChannel, memberIds: string[], hostRoleIds: string[] ): OverwriteResolvable[] {
        const everyoneId = lobby.guild.roles.everyone.id,
            botId = lobby.client.user.id;

        const entries = new Map<string, { id: string; type: OverwriteType; allow: bigint; deny: bigint }>();

        for ( const overwrite of PermissionsManager.$.getChannelDefaultInheritedPermissions( lobby ) ) {
            if ( botId !== overwrite.id ) {
                entries.set( overwrite.id, {
                    id: overwrite.id,
                    type: overwrite.type,
                    allow: new PermissionsBitField( overwrite.allow ).bitfield & ~ ROOM_ACCESS,
                    deny: new PermissionsBitField( overwrite.deny ).bitfield
                } );
            }
        }

        const set = ( id: string, type: OverwriteType, allow: bigint, deny: bigint ) => {
            const entry = entries.get( id ) ?? { id, type, allow: 0n, deny: 0n };

            entries.set( id, { ... entry, allow: ( entry.allow | allow ) & ~ deny, deny: ( entry.deny | deny ) & ~ allow } );
        };

        set( everyoneId, OverwriteType.Role, 0n, ROOM_ACCESS );

        hostRoleIds.forEach( ( roleId ) => set( roleId, OverwriteType.Role, ROOM_ACCESS, 0n ) );
        memberIds.forEach( ( memberId ) => set( memberId, OverwriteType.Member, ROOM_ACCESS, 0n ) );

        return [ ... entries.values(), { id: botId, ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS } ];
    }

    /**
     * Function getPlayersPresence() :: Each member picked for a split, and whether they are ready for
     * it - a person, in the lobby.
     */
    public getPlayersPresence( lobby: VoiceChannel, playerIds: string[] ) {
        return playerIds.map( ( id ) => {
            const member = lobby.members.get( id );

            return { id, isReady: !! member && ! member.user.bot };
        } );
    }

    /**
     * Function watchLobbyPresence() :: Have a screen drawn again whenever somebody comes into the lobby
     * or leaves it - until `expiresAt`, or until it is let go.
     */
    public watchLobbyPresence( lobbyId: string, screenId: string, redraw: () => Promise<void>, expiresAt: number ) {
        const watchers = this.presenceWatchers.get( lobbyId ) ?? new Map();

        watchers.set( screenId, { redraw, expiresAt } );

        this.presenceWatchers.set( lobbyId, watchers );
    }

    public unwatchLobbyPresence( lobbyId: string, screenId: string ) {
        const watchers = this.presenceWatchers.get( lobbyId );

        watchers?.delete( screenId );

        if ( watchers && ! watchers.size ) {
            this.presenceWatchers.delete( lobbyId );
        }
    }

    /**
     * Function redrawWatchers() :: Draw again every screen waiting on who is in this lobby.
     *
     * A screen that cannot be drawn any more - dismissed, replaced by another press, or past the time
     * discord takes its edits - is let go rather than tried again on every move.
     */
    private async redrawWatchers( lobbyId: string ) {
        const watchers = this.presenceWatchers.get( lobbyId );

        if ( ! watchers ) {
            return;
        }

        for ( const [ screenId, watcher ] of [ ... watchers ] ) {
            if ( watcher.expiresAt <= Date.now() ) {
                this.unwatchLobbyPresence( lobbyId, screenId );

                continue;
            }

            await watcher.redraw().catch( () => this.unwatchLobbyPresence( lobbyId, screenId ) );
        }
    }

    /**
     * Function onJoin() :: Draw again the screens waiting on who is in this channel, and keep a member
     * who has picked a team to that team's room.
     */
    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args,
            { channelId, member } = newState;

        if ( ! channelId || ! member || member.user.bot ) {
            return;
        }

        await this.redrawWatchers( channelId );

        const roomDB = await ChannelModel.$.getByChannelId( channelId );

        if ( ! roomDB?.isLobbyRoom || ! roomDB.ownerChannelId ) {
            return;
        }

        const lobbyId = roomDB.ownerChannelId;

        await this.chain( lobbyId, () => this.keepToPickedRoom( newState.guild, lobbyId, channelId, member ) );
    }

    /**
     * Function keepToPickedRoom() :: Close the other teams' rooms on a member who walked into a picked
     * team's room, for as long as the split lasts - so nobody listens in on the other side.
     *
     * Only picked teams: a dealt room is shut to all but its own members from the start. The lobby's
     * hosts and the server's admins are left free to go between rooms, as a teacher goes between
     * breakout groups. A member a host moves to another team is kept to that one instead.
     */
    private async keepToPickedRoom( guild: Guild, lobbyId: string, roomId: string, member: GuildMember ) {
        const lobbyDB = await ChannelModel.$.getByChannelId( lobbyId );

        if ( ! lobbyDB?.isLobbyMaster ) {
            return;
        }

        const settings = await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id );

        if ( TEAM_LOBBY_SPLIT_MODES.PICK_TEAMS !== settings?.lobbySplitMode || this.isFreeToRoam( member, settings.lobbyHostRoleIds ) ) {
            return;
        }

        const roomsDB = await ChannelModel.$.getLobbyRoomsByLobbyId( guild.id, lobbyId );

        for ( const roomDB of roomsDB ) {
            const room = guild.channels.cache.get( roomDB.channelId );

            if ( room?.type !== ChannelType.GuildVoice ) {
                continue;
            }

            const isShut = !! room.permissionOverwrites.cache.get( member.id )?.deny.has( PermissionsBitField.Flags.Connect );

            if ( roomDB.channelId === roomId ) {
                // Let back into the room they are now in - deleting the entry instead would take away
                // the way in a split kept to picked members gave them.
                if ( isShut ) {
                    await room.permissionOverwrites.edit( member.id, { ViewChannel: true, Connect: true } );
                }

                continue;
            }

            if ( ! isShut ) {
                await room.permissionOverwrites.edit( member.id, { ViewChannel: false, Connect: false } );
            }
        }
    }

    /**
     * Function isFreeToRoam() :: Whether this member may go between a split's rooms - the holders of a
     * lobby's host roles, and the server's owner and administrators, whom discord lets past a room's
     * overwrites in any case. The same who a dealt room lets in, so both kinds of split agree.
     */
    private isFreeToRoam( member: GuildMember, hostRoleIds: string[] ) {
        return member.id === member.guild.ownerId ||
            member.permissions.has( PermissionsBitField.Flags.Administrator ) ||
            hostRoleIds.some( ( roleId ) => member.roles.cache.has( roleId ) );
    }

    /**
     * Function getRoomPermissions() :: The overwrites a lobby's room is created with - the lobby's own,
     * so whoever may join the lobby may join its rooms and nobody else may, with the bot granted what
     * it needs on top.
     */
    private getRoomPermissions( lobby: VoiceChannel ): OverwriteResolvable[] {
        return PermissionsManager.$.mergeChannelPermissionOverwrites(
            PermissionsManager.$.getChannelDefaultInheritedPermissions( lobby ),
            [ { id: lobby.client.user.id, ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS } ]
        );
    }

    /**
     * Function chain() :: Run this lobby's work after whatever it is already doing.
     */
    private chain<T>( lobbyId: string, work: () => Promise<T> ): Promise<T> {
        const previous = this.running.get( lobbyId ) ?? Promise.resolve();

        const run = previous.then( work );

        const settled = run.then( () => undefined, () => undefined );

        this.running.set( lobbyId, settled );

        void settled.then( () => {
            if ( this.running.get( lobbyId ) === settled ) {
                this.running.delete( lobbyId );
            }
        } );

        return run;
    }
}

export default TeamLobbyService;
