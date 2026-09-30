import crypto from "node:crypto";

import {
    ChannelType,
    DiscordAPIError,
    GuildScheduledEventEntityType,
    GuildScheduledEventStatus,
    PermissionFlagsBits,
    RESTJSONErrorCodes
} from "discord.js";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { GuildEventRunModel } from "@vertix.gg/data/src/models/guild-event-run-model";
import { GuildEventSettingsModel } from "@vertix.gg/data/src/models/guild-event-settings-model";

import { DISCORD_SCHEDULED_EVENT_SUBSCRIBERS_PAGE_LIMIT } from "@vertix.gg/definitions/src/discord-limits-definitions";
import {
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_ERRORS,
    GUILD_EVENTS_LIMITS,
    GUILD_EVENTS_TIMINGS,
    resolveGuildEventsSettings,
    toGuildEventsClockTimings
} from "@vertix.gg/definitions/src/guild-events-definitions";

import { ownsGuild } from "@vertix.gg/bot/src/definitions/sharding";
import { DEFAULT_EVENTS_CHANNEL_BOT_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";
import { GUILD_EVENT_BOARD_STATES, GUILD_EVENTS_HASH_ALGORITHM } from "@vertix.gg/bot/src/definitions/guild-events";

import { GuildEventsManager } from "@vertix.gg/bot/src/managers/guild-events-manager";
import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { GUILD_EVENT_CLOCK_ACTIONS, GuildEventRunClock } from "@vertix.gg/bot/src/utils/guild-events/guild-event-run-clock";
import { GuildEventAttendance } from "@vertix.gg/bot/src/utils/guild-events/guild-event-attendance";

import { getMissingEventsChannelPermissions } from "@vertix.gg/bot/src/ui/general/events/events-channel-utils";

import type {
    Collection,
    Guild,
    GuildScheduledEvent,
    MessageCreateOptions,
    TextChannel,
    VoiceBasedChannel
} from "discord.js";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";
import type { IGuildEventsSettingsView, TGuildEventsError } from "@vertix.gg/definitions/src/guild-events-definitions";
import type { GetGuildEventsStatusResponse } from "@vertix.gg/definitions/src/ipc-definitions";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";

import type { TGuildEventBoardState } from "@vertix.gg/bot/src/definitions/guild-events";
import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";
import type { IGuildEventRunState, TGuildEventRoomSource } from "@vertix.gg/bot/src/managers/guild-events-manager";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { IGuildEventAttendeeState } from "@vertix.gg/bot/src/utils/guild-events/guild-event-attendance";
import type { IGuildEventClockEvent } from "@vertix.gg/bot/src/utils/guild-events/guild-event-run-clock";

const MS_PER_SECOND = 1000;

const SECONDS_PER_MINUTE = 60;

/** What a post pings, when it pings anybody: the mentions, and permission for exactly those to notify. */
type TGuildEventsPing = Pick<MessageCreateOptions, "content" | "allowedMentions">;

/**
 * A brace in an event's name would be read by the template engine as the start of a variable of
 * its own, so a name is drawn with look-alikes instead.
 */
const NAME_BRACE_REPLACEMENTS = [ [ "{", "｛" ], [ "}", "｝" ] ] as const;

/** What discord answers when the bot may not see or write where it was asked to. */
const FORBIDDEN_CODES: readonly number[] = [
    RESTJSONErrorCodes.UnknownChannel,
    RESTJSONErrorCodes.MissingAccess,
    RESTJSONErrorCodes.MissingPermissions
];

/**
 * Runs Events: a check-in board before each voice event, who came and who did not, a "need a sub"
 * post, and the attendance the board ends as.
 *
 * Two things move a run. A sweep every minute is the clock - it opens runs, freezes rosters and ends
 * runs, and catches up on anything missed across a reconnect. Voice moves are the attendance - a
 * member arriving or leaving is applied at once, so the board keeps up with the room.
 *
 * Only this bot's own runs, in the servers this process holds and whose setup was last saved from
 * this bot: two bots read this database, and a server holding both must not get every board twice.
 */
export class GuildEventsService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
}> {
    private readonly debugger: Debugger;

    private sweepInterval?: NodeJS.Timeout;

    /** Whether a sweep is still going - the next one waits for its turn rather than running over it. */
    private isSweeping = false;

    public static getName() {
        return "VertixBot/Services/GuildEvents";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", "VertixBot/Services/GuildEvents" ) );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            channelService: "VertixBot/Services/Channel"
        };
    }

    protected async initialize() {
        await super.initialize();

        // Subscribed once the channel service is up - the event bus refuses a listener for an object
        // it has not registered yet.
        const onVoiceMove = ( args: IChannelEnterGenericArgs | IChannelLeaveGenericArgs ) => this.onVoiceMove( args );

        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", onVoiceMove );
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", onVoiceMove );

        this.services.appService.onceReady( async() => {
            await this.restore().catch( ( error ) => {
                this.logger.error( this.restore, "Could not pick up the open runs", error );
            } );

            this.scheduleSweep();
        } );
    }

    /**
     * Function onVoiceMove() :: A member moved in voice - bring every run it concerns in line.
     *
     * Asked about every join, leave and switch in every channel the bot can see, so it looks at the
     * runs this process holds first and stops at the first sign a move is not theirs.
     */
    public onVoiceMove( args: IChannelEnterGenericArgs | IChannelLeaveGenericArgs ) {
        const { oldState, newState } = args;

        if ( newState.member?.user.bot ) {
            return;
        }

        const runs = GuildEventsManager.$.getForGuild( newState.guild.id );

        if ( ! runs.length ) {
            return;
        }

        const now = Date.now(),
            userId = newState.id,
            channelId = newState.channelId,
            displayName = newState.member?.displayName;

        for ( const run of runs ) {
            const wasIn = null !== oldState.channelId && run.watchedChannelIds.has( oldState.channelId ),
                mayBeIn = null !== channelId && ( run.watchedChannelIds.has( channelId ) || null !== run.roomSource );

            if ( ! wasIn && ! mayBeIn ) {
                continue;
            }

            if ( displayName ) {
                run.names.set( userId, displayName );
            }

            GuildEventsManager.$.chain( run.runId, async() => {
                await this.applyPresence( run, userId, await this.isInEvent( run, channelId ), now );

                this.updateEmptySince( run, now );
                this.scheduleRedraw( run );
            } ).catch( ( error ) => {
                this.logger.error( this.onVoiceMove, `Guild id: '${ run.guildId }' - Run '${ run.runId }' could not take a move`, error );
            } );
        }
    }

    /**
     * Function getStatus() :: What the dashboard has to hear before pointing Events at a channel or a role.
     *
     * Which bot answered - a save from the dashboard makes it the one that runs Events in the server,
     * as saving from its `/setup` would - what it lacks to post in each channel asked about, and
     * whether a ping of each role asked about would notify anybody: a role nobody may mention is
     * pinged in silence, unless the bot may mention every role.
     */
    public getStatus( guildId: string, channelIds: string[], roleIds: string[] ): GetGuildEventsStatusResponse {
        const client = this.services.appService.getClient(),
            guild = client.guilds.cache.get( guildId );

        if ( ! guild ) {
            return { applicationId: client.user.id, isBotInGuild: false, channels: {}, roles: {} };
        }

        const canMentionEveryRole = !! guild.members.me?.permissions.has( PermissionFlagsBits.MentionEveryone );

        return {
            applicationId: client.user.id,
            isBotInGuild: true,
            channels: Object.fromEntries( channelIds.map( ( channelId ) =>
                [ channelId, getMissingEventsChannelPermissions( guild, channelId ) ]
            ) ),
            roles: Object.fromEntries( roleIds.map( ( roleId ) => {
                const role = roleId !== guild.id ? guild.roles.cache.get( roleId ) : undefined;

                return [ roleId, role ? { isPingable: role.mentionable || canMentionEveryRole } : null ];
            } ) )
        };
    }

    /**
     * Function sweep() :: Look over every server this bot runs Events in.
     *
     * A run whose server no longer runs Events here - turned off, or saved from the other bot since -
     * ends now, with what it has.
     */
    public async sweep() {
        if ( this.isSweeping ) {
            return;
        }

        this.isSweeping = true;

        try {
            const client = this.services.appService.getClient(),
                now = Date.now(),
                enabled = await GuildEventSettingsModel.$.getEnabled( client.user.id ),
                runningHere = new Set<string>();

            for ( const settings of enabled ) {
                const guild = settings.channelId && ownsGuild( settings.guildId )
                    ? client.guilds.cache.get( settings.guildId )
                    : undefined;

                if ( ! guild ) {
                    continue;
                }

                runningHere.add( guild.id );

                await this.sweepGuild( guild, settings, now ).catch( ( error ) => {
                    this.logger.error( this.sweep, `Guild id: '${ guild.id }' - Could not look over its events`, error );
                } );
            }

            for ( const run of GuildEventsManager.$.getAll() ) {
                if ( runningHere.has( run.guildId ) ) {
                    continue;
                }

                await GuildEventsManager.$.chain( run.runId, () => this.end( run, now ) ).catch( ( error ) => {
                    this.logger.error( this.sweep, `Guild id: '${ run.guildId }' - Could not end run '${ run.runId }'`, error );
                } );
            }

            const openRunIds = GuildEventsManager.$.getAll().map( ( run ) => run.runId );

            if ( openRunIds.length ) {
                await GuildEventRunModel.$.checkpoint( openRunIds, new Date( now ) );
            }
        } finally {
            this.isSweeping = false;
        }
    }

    private scheduleSweep() {
        if ( this.sweepInterval ) {
            return;
        }

        const pass = () => this.sweep().catch( ( error ) => {
            this.logger.error( this.scheduleSweep, "Events sweep failed", error );
        } );

        this.sweepInterval = setInterval( pass, GUILD_EVENTS_TIMINGS.SWEEP_INTERVAL_MS );

        pass();
    }

    /**
     * Function restore() :: Pick up the runs this bot left open when it last stopped.
     *
     * A run in a server the bot is no longer in, or past the longest any run may last, is closed in
     * the database only - there is nowhere left to post, or nothing worth posting. One past its own
     * server's limit, but not past that, is ended by the first sweep, which posts its attendance.
     */
    private async restore() {
        const client = this.services.appService.getClient(),
            now = Date.now(),
            rows = await GuildEventRunModel.$.getOpen( client.user.id ),
            staleRunIds: string[] = [];

        for ( const row of rows ) {
            if ( ! ownsGuild( row.guildId ) ) {
                continue;
            }

            const guild = client.guilds.cache.get( row.guildId );

            if ( ! guild || now >= row.occurrenceStartAt.getTime() + GUILD_EVENTS_TIMINGS.RUN_MAX_MS ) {
                staleRunIds.push( row.id );

                continue;
            }

            const settings = resolveGuildEventsSettings( await GuildEventSettingsModel.$.get( row.guildId ) );

            GuildEventsManager.$.add( await this.loadRun( guild, row, settings, now ) );
        }

        if ( staleRunIds.length ) {
            await GuildEventRunModel.$.close( staleRunIds, new Date( now ) );
        }
    }

    /**
     * Function loadRun() :: Rebuild an open run from the database.
     *
     * A visit still open when the bot went down ends at the run's last checkpoint if the member is
     * gone now - when exactly they left cannot be known - and carries on if they are still there.
     */
    private async loadRun( guild: Guild, row: PrismaBot.GuildEventRun, settings: IGuildEventsSettingsView, now: number ) {
        const run = this.createRunState( row, settings ),
            checkpointAt = ( row.checkpointAt ?? row.updatedAt ).getTime();

        for ( const attendeeRow of await GuildEventRunModel.$.getAttendees( row.id ) ) {
            run.attendees.set( attendeeRow.userId, this.toAttendeeState( attendeeRow ) );

            if ( attendeeRow.displayName ) {
                run.names.set( attendeeRow.userId, attendeeRow.displayName );
            }

            if ( attendeeRow.interested ) {
                run.rosterIds.add( attendeeRow.userId );
            }
        }

        run.roomSource = await this.resolveRoomSource( guild, run );

        const presentIds = await this.findPresentIds( guild, run );

        for ( const attendee of [ ... run.attendees.values() ] ) {
            if ( null === attendee.sessionStartedAt || presentIds.has( attendee.userId ) ) {
                continue;
            }

            const credited = GuildEventAttendance.$.creditUpTo( attendee, checkpointAt );

            run.attendees.set( attendee.userId, credited );

            await this.saveAttendee( run, credited );
        }

        await this.reconcilePresence( guild, run, now );

        return run;
    }

    /**
     * Function sweepGuild() :: Move on every run the server has open, and open the events now due.
     *
     * A server that limited Events to some channels gets runs only for events held in those - one
     * already open when the limit changed runs to its end.
     */
    private async sweepGuild( guild: Guild, settings: PrismaBot.GuildEventSettings, now: number ) {
        const view = resolveGuildEventsSettings( settings ),
            timings = toGuildEventsClockTimings( view );

        for ( const run of GuildEventsManager.$.getForGuild( guild.id ) ) {
            await GuildEventsManager.$.chain( run.runId, () => this.tick( guild, view, run, now ) ).catch( ( error ) => {
                this.logger.error( this.sweepGuild, `Guild id: '${ guild.id }' - Run '${ run.runId }' could not be moved on`, error );
            } );
        }

        for ( const event of guild.scheduledEvents.cache.values() ) {
            const clockEvent = this.toClockEvent( event );

            if ( ! clockEvent || GuildEventsManager.$.getForEvent( event.id ) ) {
                continue;
            }

            if ( view.eventChannelIds.length && ! view.eventChannelIds.includes( event.channelId ?? "" ) ) {
                continue;
            }

            if ( GuildEventsManager.$.isDone( event.id, clockEvent.scheduledStartAt ) ) {
                continue;
            }

            if ( GUILD_EVENT_CLOCK_ACTIONS.OPEN !== GuildEventRunClock.$.decide( now, clockEvent, null, timings ) ) {
                continue;
            }

            await this.open( guild, settings, view, event, clockEvent.scheduledStartAt, now );
        }
    }

    /**
     * Function tick() :: Move one open run on, as the clock says.
     */
    private async tick( guild: Guild, view: IGuildEventsSettingsView, run: IGuildEventRunState, now: number ) {
        const event = guild.scheduledEvents.cache.get( run.scheduledEventId ) ?? null;

        run.settings = view;

        if ( GuildScheduledEventStatus.Active === event?.status ) {
            run.wasActive = true;
        }

        if ( event && event.name !== run.name ) {
            run.name = event.name;

            await GuildEventRunModel.$.update( run.runId, { name: event.name } );
        }

        if ( GUILD_EVENT_RUN_PHASES.CHECK_IN === run.phase && event ) {
            await this.refreshRoster( run, event );
        }

        await this.reconcilePresence( guild, run, now );

        const clockEvent = event ? this.toClockEvent( event ) : null;

        switch ( GuildEventRunClock.$.decide( now, clockEvent, this.toClockRun( run ), toGuildEventsClockTimings( view ) ) ) {
            case GUILD_EVENT_CLOCK_ACTIONS.FREEZE:
                await this.freeze( guild, run, now );
                break;

            case GUILD_EVENT_CLOCK_ACTIONS.END:
                await this.end( run, now );
                break;

            case GUILD_EVENT_CLOCK_ACTIONS.CANCEL:
                await this.cancel( run, now, GUILD_EVENT_BOARD_STATES.CANCELED, null );
                break;

            case GUILD_EVENT_CLOCK_ACTIONS.WITHDRAW:
                await this.cancel( run, now, GUILD_EVENT_BOARD_STATES.MOVED, clockEvent?.scheduledStartAt ?? null );
                break;

            default:
                this.scheduleRedraw( run );
        }
    }

    /**
     * Function open() :: Start the run of one occurrence and put its board up.
     *
     * Nothing is started for an event whose voice channel the bot cannot see: it could read neither
     * the roster nor who is in the channel, and a board saying nobody came would be a lie.
     */
    private async open(
        guild: Guild,
        settings: PrismaBot.GuildEventSettings,
        view: IGuildEventsSettingsView,
        event: GuildScheduledEvent,
        occurrenceStartAt: number,
        now: number
    ) {
        const postChannel = this.getPostChannel( guild, settings.channelId );

        if ( ! postChannel ) {
            await this.reportSettingsError( settings, GUILD_EVENTS_ERRORS.POST_CHANNEL_MISSING );

            return;
        }

        if ( PermissionsManager.$.getMissingChannelPermissionsForBot( postChannel, DEFAULT_EVENTS_CHANNEL_BOT_PERMISSIONS ).length ) {
            await this.reportSettingsError( settings, GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN );

            return;
        }

        const me = guild.members.me;

        if ( ! event.channelId || ! me || ! event.channel?.permissionsFor( me ).has( PermissionFlagsBits.ViewChannel ) ) {
            await this.reportSettingsError( settings, GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN );

            GuildEventsManager.$.markDone( event.id, occurrenceStartAt );

            return;
        }

        const { run: row, isCreated } = await GuildEventRunModel.$.open( {
            applicationId: me.id,
            guildId: guild.id,
            scheduledEventId: event.id,
            occurrenceStartAt: new Date( occurrenceStartAt ),
            name: event.name,
            voiceChannelId: event.channelId,
            postChannelId: postChannel.id
        } );

        if ( ! isCreated ) {
            // Opened before a restart this process has not caught up with yet, or finished already.
            if ( GUILD_EVENT_RUN_PHASES.CHECK_IN === row.phase || GUILD_EVENT_RUN_PHASES.RUNNING === row.phase ) {
                GuildEventsManager.$.add( await this.loadRun( guild, row, view, now ) );
            } else {
                GuildEventsManager.$.markDone( event.id, occurrenceStartAt );
            }

            return;
        }

        const run = this.createRunState( row, view );

        this.debugger.log( this.open, `Guild id: '${ guild.id }' - Check-in opened for '${ event.name }'` );

        run.roomSource = await this.resolveRoomSource( guild, run );

        await this.refreshRoster( run, event );
        await this.reconcilePresence( guild, run, now );

        GuildEventsManager.$.add( run );

        await GuildEventsManager.$.chain( run.runId, () => this.postBoard( guild, run, now ) );
    }

    /**
     * Function freeze() :: Stop following the roster, mark who never came, and ask for subs.
     *
     * Only once as many are missing as the server asks subs for at all - a server that minds only a
     * short team, not one absence, sets that above one.
     */
    private async freeze( guild: Guild, run: IGuildEventRunState, now: number ) {
        await this.writeRoster( run );

        const noShowCount = [ ... run.attendees.values() ].filter( ( attendee ) => attendee.noShow ).length,
            { subPostsEnabled, subMinMissing } = run.settings;

        this.debugger.log( this.freeze, `Guild id: '${ run.guildId }' - Run '${ run.runId }' froze with ${ noShowCount } missing` );

        run.phase = GUILD_EVENT_RUN_PHASES.RUNNING;
        run.frozenAt = now;
        run.subsNeeded = subPostsEnabled && noShowCount >= subMinMissing
            ? GuildEventAttendance.$.countSubsNeeded( noShowCount, this.getFreeSeats( guild, run ) )
            : 0;

        await GuildEventRunModel.$.update( run.runId, {
            phase: GUILD_EVENT_RUN_PHASES.RUNNING,
            frozenAt: new Date( now ),
            subsNeeded: run.subsNeeded
        } );

        this.scheduleRedraw( run );

        if ( run.subsNeeded > 0 ) {
            await this.postSubPost( guild, run );
        }
    }

    /**
     * Function end() :: Close every visit, turn the board into the attendance, copy it to the log
     * channel, and take the sub post down.
     *
     * A run that ends before its roster froze - Events turned off during check-in - still marks who
     * never came, so its attendance says the same as any other. The least time in voice that counts
     * is written on the run, so the history keeps saying what the board said.
     */
    private async end( run: IGuildEventRunState, now: number ) {
        await this.closeVisits( run, now );

        if ( null === run.frozenAt ) {
            await this.writeRoster( run );
        }

        this.debugger.log( this.end, `Guild id: '${ run.guildId }' - Run '${ run.runId }' ended` );

        run.phase = GUILD_EVENT_RUN_PHASES.ENDED;

        await GuildEventRunModel.$.update( run.runId, {
            phase: GUILD_EVENT_RUN_PHASES.ENDED,
            endedAt: new Date( now ),
            minVoiceSeconds: run.settings.minVoiceMinutes * SECONDS_PER_MINUTE
        } );

        const guild = this.getGuild( run.guildId );

        if ( guild ) {
            await this.editBoard( guild, run, GUILD_EVENT_BOARD_STATES.ENDED, now, null );
            await this.postAttendanceCopy( guild, run, now );
            await this.deletePosted( guild, run, run.subPostMessageId );
        }

        GuildEventsManager.$.finish( run );
    }

    /**
     * Function cancel() :: Say on the board that the event is off, or has moved, and keep no attendance.
     */
    private async cancel( run: IGuildEventRunState, now: number, boardState: TGuildEventBoardState, movedToAt: number | null ) {
        await this.closeVisits( run, now );

        this.debugger.log( this.cancel, `Guild id: '${ run.guildId }' - Run '${ run.runId }' is off - '${ boardState }'` );

        run.phase = GUILD_EVENT_RUN_PHASES.CANCELED;

        await GuildEventRunModel.$.update( run.runId, { phase: GUILD_EVENT_RUN_PHASES.CANCELED, endedAt: new Date( now ) } );

        const guild = this.getGuild( run.guildId );

        if ( guild ) {
            await this.editBoard( guild, run, boardState, now, movedToAt );
            await this.deletePosted( guild, run, run.subPostMessageId );
        }

        GuildEventsManager.$.finish( run );
    }

    /**
     * Function writeRoster() :: Mark, in memory and in the database, who on the roster had come.
     */
    private async writeRoster( run: IGuildEventRunState ) {
        GuildEventAttendance.$.freeze( run.attendees, run.rosterIds );

        const checkedInIds = [ ... run.attendees.values() ]
            .filter( ( attendee ) => null !== attendee.checkedInAt )
            .map( ( attendee ) => attendee.userId );

        await GuildEventRunModel.$.freezeRoster( run.runId, run.guildId, [ ... run.rosterIds ], checkedInIds, run.names );
    }

    private async closeVisits( run: IGuildEventRunState, now: number ) {
        for ( const attendee of [ ... run.attendees.values() ] ) {
            if ( null === attendee.sessionStartedAt ) {
                continue;
            }

            const closed = GuildEventAttendance.$.creditUpTo( attendee, now );

            run.attendees.set( attendee.userId, closed );

            await this.saveAttendee( run, closed );
        }
    }

    /**
     * Function refreshRoster() :: Read the event's "Interested" list again.
     *
     * A failure keeps the list read last time. Not being allowed to read it is recorded once, and not
     * asked about again for the rest of the run.
     */
    private async refreshRoster( run: IGuildEventRunState, event: GuildScheduledEvent ) {
        if ( GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN === run.lastError ) {
            return;
        }

        try {
            const roster = await this.fetchRoster( event );

            run.rosterIds = new Set( roster.keys() );

            roster.forEach( ( name, userId ) => run.names.set( userId, name ) );
        } catch( error ) {
            if ( this.isForbidden( error ) ) {
                await this.recordRunError( run, GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN );

                return;
            }

            this.logger.warn( this.refreshRoster, `Guild id: '${ run.guildId }' - Could not read the roster of '${ run.scheduledEventId }'`, error );
        }
    }

    /**
     * Function fetchRoster() :: The event's "Interested" list, each member with the name the server
     * shows for them - their nickname there, else the name on their account.
     */
    private async fetchRoster( event: GuildScheduledEvent ) {
        const roster = new Map<string, string>();

        let after: string | undefined;

        while ( roster.size < GUILD_EVENTS_LIMITS.ROSTER_MAX ) {
            const page = await event.fetchSubscribers( {
                limit: DISCORD_SCHEDULED_EVENT_SUBSCRIBERS_PAGE_LIMIT,
                withMember: true,
                ... ( after ? { after } : {} )
            } );

            for ( const subscriber of page.values() ) {
                if ( ! subscriber.user.bot && roster.size < GUILD_EVENTS_LIMITS.ROSTER_MAX ) {
                    roster.set(
                        subscriber.user.id,
                        subscriber.member?.displayName ?? subscriber.user.globalName ?? subscriber.user.username
                    );
                }
            }

            if ( page.size < DISCORD_SCHEDULED_EVENT_SUBSCRIBERS_PAGE_LIMIT ) {
                break;
            }

            after = this.getHighestId( page );
        }

        return roster;
    }

    /**
     * Function getHighestId() :: The last member of a page, by id - where the next page starts.
     */
    private getHighestId<T>( page: Collection<string, T> ) {
        let highest: string | undefined;

        for ( const id of page.keys() ) {
            if ( undefined === highest || BigInt( id ) > BigInt( highest ) ) {
                highest = id;
            }
        }

        return highest;
    }

    /**
     * Function reconcilePresence() :: Bring every attendance in line with who is in the event's channels now.
     *
     * What a sweep does on top of the voice moves - it covers moves missed across a reconnect, and a
     * room whose row was not written yet when its first member was moved into it.
     */
    private async reconcilePresence( guild: Guild, run: IGuildEventRunState, now: number ) {
        const presentIds = await this.findPresentIds( guild, run );

        for ( const userId of presentIds ) {
            await this.applyPresence( run, userId, true, now );
        }

        for ( const attendee of [ ... run.attendees.values() ] ) {
            if ( null !== attendee.sessionStartedAt && ! presentIds.has( attendee.userId ) ) {
                await this.applyPresence( run, attendee.userId, false, now );
            }
        }

        this.updateEmptySince( run, now );
    }

    private async findPresentIds( guild: Guild, run: IGuildEventRunState ) {
        const presentIds = new Set<string>(),
            isEventChannel = new Map<string, boolean>();

        for ( const state of guild.voiceStates.cache.values() ) {
            if ( ! state.channelId || state.member?.user.bot ) {
                continue;
            }

            if ( ! isEventChannel.has( state.channelId ) ) {
                isEventChannel.set( state.channelId, await this.isInEvent( run, state.channelId ) );
            }

            if ( isEventChannel.get( state.channelId ) ) {
                presentIds.add( state.id );

                if ( state.member?.displayName ) {
                    run.names.set( state.id, state.member.displayName );
                }
            }
        }

        return presentIds;
    }

    private async applyPresence( run: IGuildEventRunState, userId: string, isPresent: boolean, now: number ) {
        const current = run.attendees.get( userId ) ?? GuildEventAttendance.$.createAttendee( userId ),
            next = GuildEventAttendance.$.observe( current, isPresent, now, GUILD_EVENT_RUN_PHASES.RUNNING === run.phase );

        if ( ! next ) {
            return;
        }

        run.attendees.set( userId, next );

        await this.saveAttendee( run, next );
    }

    private updateEmptySince( run: IGuildEventRunState, now: number ) {
        const isOccupied = [ ... run.attendees.values() ].some( ( attendee ) => null !== attendee.sessionStartedAt );

        run.emptySince = isOccupied ? null : run.emptySince ?? now;
    }

    /**
     * Function isInEvent() :: Whether a channel is one of the event's.
     *
     * Its own channel, or a room its generator or pool opened. A room is looked up only in a server
     * whose event is held at one, and remembered only once confirmed - a room is looked up again until
     * its row exists, since the member is moved in before that row is written.
     */
    private async isInEvent( run: IGuildEventRunState, channelId: string | null ) {
        if ( ! channelId ) {
            return false;
        }

        if ( run.watchedChannelIds.has( channelId ) ) {
            return true;
        }

        if ( ! run.roomSource ) {
            return false;
        }

        const row = await ChannelModel.$.getByChannelId( channelId );

        const isRoom = !! row && ( "generator" === run.roomSource.kind
            ? row.isDynamic && row.ownerChannelId === run.roomSource.generatorChannelId
            : row.isScaling && row.ownerChannelId === run.roomSource.poolRowId );

        if ( isRoom ) {
            run.watchedChannelIds.add( channelId );
        }

        return isRoom;
    }

    /**
     * Function resolveRoomSource() :: Whether the event is held at a generator or a pool, and its rooms so far.
     */
    private async resolveRoomSource( guild: Guild, run: IGuildEventRunState ): Promise<TGuildEventRoomSource | null> {
        const row = await ChannelModel.$.getByChannelId( run.voiceChannelId );

        if ( row?.isMaster ) {
            for ( const room of await ChannelModel.$.getDynamicsByMasterId( guild.id, run.voiceChannelId ) ) {
                run.watchedChannelIds.add( room.channelId );
            }

            return { kind: "generator", generatorChannelId: run.voiceChannelId };
        }

        if ( row?.isScalingMaster ) {
            for ( const room of await ChannelModel.$.getScalingChannelsByMasterId( guild.id, row.id ) ) {
                run.watchedChannelIds.add( room.channelId );
            }

            return { kind: "pool", poolRowId: row.id };
        }

        return null;
    }

    /**
     * Function getFreeSeats() :: How many more the event's channel takes, or null when it has no limit.
     *
     * Only for an event held in a channel of its own - a generator's or a pool's rooms are as many as
     * it takes.
     */
    private getFreeSeats( guild: Guild, run: IGuildEventRunState ) {
        const channel = guild.channels.cache.get( run.voiceChannelId );

        if ( run.roomSource || ! channel?.isVoiceBased() || ! channel.userLimit ) {
            return null;
        }

        return Math.max( 0, channel.userLimit - channel.members.filter( ( member ) => ! member.user.bot ).size );
    }

    /**
     * Function getJoinChannel() :: Where the join link takes somebody.
     *
     * The event's own channel - except at a generator, where joining it opens an empty room of their
     * own: there it is the fullest of the event's rooms that still has a seat free.
     */
    private getJoinChannel( guild: Guild, run: IGuildEventRunState ): VoiceBasedChannel | null {
        const eventChannel = guild.channels.cache.get( run.voiceChannelId ),
            fallback = eventChannel?.isVoiceBased() ? eventChannel : null;

        if ( "generator" !== run.roomSource?.kind ) {
            return fallback;
        }

        const rooms = [ ... run.watchedChannelIds ]
            .filter( ( channelId ) => channelId !== run.voiceChannelId )
            .map( ( channelId ) => guild.channels.cache.get( channelId ) )
            .filter( ( channel ): channel is VoiceBasedChannel => !! channel?.isVoiceBased() )
            .filter( ( channel ) => channel.members.size > 0 && ( ! channel.userLimit || channel.members.size < channel.userLimit ) )
            .sort( ( a, b ) => b.members.size - a.members.size );

        return rooms[ 0 ] ?? fallback;
    }

    private async postBoard( guild: Guild, run: IGuildEventRunState, now: number ) {
        const channel = this.getPostChannel( guild, run.postChannelId );

        if ( ! channel ) {
            await this.recordRunError( run, GUILD_EVENTS_ERRORS.POST_CHANNEL_MISSING );

            return;
        }

        const args = this.buildBoardArgs( guild, run, this.getBoardState( run ), now, null ),
            message = await this.post( channel, "VertixBot/UI-General/EventBoardAdapter", args, this.getCheckInPing( guild, run ) );

        if ( ! message ) {
            await this.recordRunError( run, GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN );

            return;
        }

        run.boardMessageId = message.id;
        run.boardHash = this.hash( args );
        run.lastBoardEditAt = now;

        await GuildEventRunModel.$.update( run.runId, { boardMessageId: message.id } );
    }

    private async postSubPost( guild: Guild, run: IGuildEventRunState ) {
        const channel = this.canPost( run ) ? this.getPostChannel( guild, run.postChannelId ) : null;

        if ( ! channel ) {
            return;
        }

        const args = this.buildSubPostArgs( guild, run ),
            message = await this.post( channel, "VertixBot/UI-General/EventNeedSubAdapter", args, this.getSubPostPing( guild, run ) );

        if ( ! message ) {
            await this.recordRunError( run, GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN );

            return;
        }

        run.subPostMessageId = message.id;
        run.subPostHash = this.hash( args );

        await GuildEventRunModel.$.update( run.runId, { subPostMessageId: message.id } );
    }

    /**
     * Function postAttendanceCopy() :: Post the finished attendance to the server's log channel too.
     *
     * A copy rather than the board itself: the board stays where members saw it, and the log is
     * somewhere of the server's choosing - often one only its staff read. Not posted twice to the one
     * channel, and a channel it cannot use is recorded for the settings screen rather than retried.
     */
    private async postAttendanceCopy( guild: Guild, run: IGuildEventRunState, now: number ) {
        const { logChannelId } = run.settings;

        if ( ! logChannelId || logChannelId === run.postChannelId ) {
            return;
        }

        const channel = this.getPostChannel( guild, logChannelId );

        if ( ! channel ) {
            await GuildEventSettingsModel.$.markError( run.guildId, GUILD_EVENTS_ERRORS.LOG_CHANNEL_MISSING );

            return;
        }

        const args = this.buildBoardArgs( guild, run, GUILD_EVENT_BOARD_STATES.ENDED, now, null ),
            isAllowed = ! PermissionsManager.$.getMissingChannelPermissionsForBot( channel, DEFAULT_EVENTS_CHANNEL_BOT_PERMISSIONS ).length,
            message = isAllowed ? await this.post( channel, "VertixBot/UI-General/EventBoardAdapter", args, null ) : null;

        if ( ! message ) {
            await GuildEventSettingsModel.$.markError( run.guildId, GUILD_EVENTS_ERRORS.LOG_CHANNEL_FORBIDDEN );
        }
    }

    /**
     * Function post() :: Post what an adapter draws, with the pings the post carries.
     *
     * Drawn and sent here rather than through the adapter's own `send()`, which has no room for a
     * ping - the boards and posts carry no component that answers, so nothing the adapter would
     * have kept about the message is ever asked for. Null when discord refused it.
     */
    private async post( channel: TextChannel, adapterName: string, args: UIArgs, ping: TGuildEventsPing | null ) {
        const adapter = this.getAdapter( adapterName );

        if ( ! adapter ) {
            return null;
        }

        try {
            return await channel.send( { ... await adapter.render( channel, args ), ... ping } );
        } catch {
            return null;
        }
    }

    /**
     * Function getCheckInPing() :: Who the board pings as check-in opens: the server's role, and -
     * when it asked for that - everybody on the roster who is not there yet, by name.
     */
    private getCheckInPing( guild: Guild, run: IGuildEventRunState ) {
        const { checkInRoleId, checkInPingInterested } = run.settings,
            userIds = checkInPingInterested
                ? [ ... run.rosterIds ]
                    .filter( ( userId ) => null === ( run.attendees.get( userId )?.checkedInAt ?? null ) )
                    .slice( 0, GUILD_EVENTS_LIMITS.PING_MEMBERS_MAX )
                : [];

        return this.toPing( this.getPingableRoleId( guild, checkInRoleId ), userIds );
    }

    private getSubPostPing( guild: Guild, run: IGuildEventRunState ) {
        return this.toPing( this.getPingableRoleId( guild, run.settings.subRoleId ), [] );
    }

    /**
     * Function getPingableRoleId() :: The role to ping, unless the server no longer has it.
     */
    private getPingableRoleId( guild: Guild, roleId: string | null ) {
        return roleId && roleId !== guild.id && guild.roles.cache.has( roleId ) ? roleId : null;
    }

    /**
     * Function toPing() :: The mentions a post opens with, allowed to notify exactly who they name.
     */
    private toPing( roleId: string | null, userIds: string[] ): TGuildEventsPing | null {
        const mentions = [ ... ( roleId ? [ `<@&${ roleId }>` ] : [] ), ... userIds.map( ( userId ) => `<@${ userId }>` ) ];

        if ( ! mentions.length ) {
            return null;
        }

        return {
            content: mentions.join( " " ),
            allowedMentions: { roles: roleId ? [ roleId ] : [], users: userIds }
        };
    }

    /**
     * Function scheduleRedraw() :: Bring the board and the sub post up to date, at most once in a while.
     *
     * A crowd arriving at once is one edit rather than one each.
     */
    private scheduleRedraw( run: IGuildEventRunState ) {
        if ( run.boardEditTimer ) {
            return;
        }

        const wait = Math.max( 0, run.lastBoardEditAt + GUILD_EVENTS_TIMINGS.BOARD_EDIT_MIN_INTERVAL_MS - Date.now() );

        run.boardEditTimer = setTimeout( () => {
            run.boardEditTimer = null;

            GuildEventsManager.$.chain( run.runId, () => this.redraw( run ) ).catch( ( error ) => {
                this.logger.error( this.scheduleRedraw, `Guild id: '${ run.guildId }' - Run '${ run.runId }' could not be redrawn`, error );
            } );
        }, wait );
    }

    private async redraw( run: IGuildEventRunState ) {
        const guild = this.getGuild( run.guildId );

        if ( ! guild || GUILD_EVENT_RUN_PHASES.ENDED === run.phase || GUILD_EVENT_RUN_PHASES.CANCELED === run.phase ) {
            return;
        }

        await this.editBoard( guild, run, this.getBoardState( run ), Date.now(), null );

        if ( ! run.subPostMessageId || ! this.canPost( run ) ) {
            return;
        }

        const args = this.buildSubPostArgs( guild, run ),
            hash = this.hash( args );

        if ( hash !== run.subPostHash && await this.editPosted( guild, run, run.subPostMessageId, "VertixBot/UI-General/EventNeedSubAdapter", args ) ) {
            run.subPostHash = hash;
        }
    }

    private async editBoard(
        guild: Guild,
        run: IGuildEventRunState,
        boardState: TGuildEventBoardState,
        now: number,
        movedToAt: number | null
    ) {
        if ( ! run.boardMessageId || ! this.canPost( run ) ) {
            return;
        }

        const args = this.buildBoardArgs( guild, run, boardState, now, movedToAt ),
            hash = this.hash( args );

        if ( hash === run.boardHash ) {
            return;
        }

        if ( await this.editPosted( guild, run, run.boardMessageId, "VertixBot/UI-General/EventBoardAdapter", args ) ) {
            run.boardHash = hash;
            run.lastBoardEditAt = Date.now();
        }
    }

    /**
     * Function editPosted() :: Redraw a message this run posted, in place.
     *
     * Drawn in memory and sent as one edit by id - no fetch first. A message somebody deleted is
     * recorded rather than posted again: whoever deleted it did not want it there.
     */
    private async editPosted( guild: Guild, run: IGuildEventRunState, messageId: string, adapterName: string, args: UIArgs ) {
        const channel = this.getPostChannel( guild, run.postChannelId ),
            adapter = this.getAdapter( adapterName );

        if ( ! channel || ! adapter ) {
            return false;
        }

        try {
            await channel.messages.edit( messageId, await adapter.render( channel, args ) );

            return true;
        } catch( error ) {
            if ( this.hasCode( error, RESTJSONErrorCodes.UnknownMessage ) ) {
                if ( messageId === run.boardMessageId ) {
                    await this.recordRunError( run, GUILD_EVENTS_ERRORS.BOARD_DELETED );
                } else {
                    run.subPostMessageId = null;
                }

                return false;
            }

            if ( this.isForbidden( error ) ) {
                await this.recordRunError( run, GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN );

                return false;
            }

            throw error;
        }
    }

    private async deletePosted( guild: Guild, run: IGuildEventRunState, messageId: string | null ) {
        const channel = messageId ? this.getPostChannel( guild, run.postChannelId ) : null;

        if ( ! channel || ! messageId ) {
            return;
        }

        await channel.messages.delete( messageId ).catch( ( error ) => {
            if ( ! this.hasCode( error, RESTJSONErrorCodes.UnknownMessage ) ) {
                this.logger.warn( this.deletePosted, `Guild id: '${ run.guildId }' - Could not take the sub post down`, error );
            }
        } );
    }

    private buildBoardArgs(
        guild: Guild,
        run: IGuildEventRunState,
        boardState: TGuildEventBoardState,
        now: number,
        movedToAt: number | null
    ): UIArgs {
        const isOpen = GUILD_EVENT_BOARD_STATES.CHECK_IN === boardState || GUILD_EVENT_BOARD_STATES.RUNNING === boardState,
            { lateAfterMs } = toGuildEventsClockTimings( run.settings ),
            minVoiceSeconds = run.settings.minVoiceMinutes * SECONDS_PER_MINUTE,
            lists = GuildEventAttendance.$.buildLists(
                run.attendees.values(),
                run.rosterIds,
                now,
                GUILD_EVENT_BOARD_STATES.ENDED === boardState,
                minVoiceSeconds * MS_PER_SECOND
            );

        const args: UIArgs = {
            boardState,
            eventName: this.toDisplayName( run.name ),
            startsAt: Math.floor( run.occurrenceStartAt / MS_PER_SECOND ),
            lateAt: Math.floor( ( run.occurrenceStartAt + lateAfterMs ) / MS_PER_SECOND ),
            minVoiceMinutes: run.settings.minVoiceMinutes,
            voiceChannelId: run.voiceChannelId,
            joinUrl: isOpen ? this.getJoinChannel( guild, run )?.url ?? null : null,
            isJoinClosed: ! isOpen
        };

        if ( null !== movedToAt ) {
            args.movedToAt = Math.floor( movedToAt / MS_PER_SECOND );
        }

        for ( const [ listName, list ] of Object.entries( lists ) ) {
            args[ listName ] = list.lines;
            args[ `${ listName }Count` ] = list.count;
            args[ `${ listName }Hidden` ] = list.hiddenCount;
        }

        return args;
    }

    private buildSubPostArgs( guild: Guild, run: IGuildEventRunState ): UIArgs {
        const joinChannel = this.getJoinChannel( guild, run );

        return {
            eventName: this.toDisplayName( run.name ),
            startsAt: Math.floor( run.occurrenceStartAt / MS_PER_SECOND ),
            voiceChannelId: joinChannel?.id ?? run.voiceChannelId,
            joinUrl: joinChannel?.url ?? null,
            stillNeeded: GuildEventAttendance.$.countStillNeeded( run.subsNeeded, run.attendees.values(), run.frozenAt ?? 0 )
        };
    }

    private getBoardState( run: IGuildEventRunState ): TGuildEventBoardState {
        return GUILD_EVENT_RUN_PHASES.RUNNING === run.phase ? GUILD_EVENT_BOARD_STATES.RUNNING : GUILD_EVENT_BOARD_STATES.CHECK_IN;
    }

    /**
     * Function canPost() :: Whether this run may still post and edit.
     *
     * Not once its board was deleted or its channel refused it; a roster it could not read is no
     * reason to stop showing who came.
     */
    private canPost( run: IGuildEventRunState ) {
        return ! run.lastError || GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN === run.lastError;
    }

    /**
     * Function recordRunError() :: Note what stopped a run, once, and tell the settings screen.
     */
    private async recordRunError( run: IGuildEventRunState, error: TGuildEventsError ) {
        if ( run.lastError === error ) {
            return;
        }

        run.lastError = error;

        await GuildEventRunModel.$.update( run.runId, { lastError: error } );

        if ( GUILD_EVENTS_ERRORS.BOARD_DELETED !== error ) {
            await GuildEventSettingsModel.$.markError( run.guildId, error );
        }
    }

    private async reportSettingsError( settings: PrismaBot.GuildEventSettings, error: TGuildEventsError ) {
        if ( settings.lastError === error ) {
            return;
        }

        settings.lastError = error;

        await GuildEventSettingsModel.$.markError( settings.guildId, error );
    }

    private async saveAttendee( run: IGuildEventRunState, attendee: IGuildEventAttendeeState ) {
        await GuildEventRunModel.$.saveAttendee( run.runId, run.guildId, attendee.userId, {
            displayName: run.names.get( attendee.userId ) ?? null,
            interested: attendee.interested,
            checkedInAt: null === attendee.checkedInAt ? null : new Date( attendee.checkedInAt ),
            late: attendee.late,
            noShow: attendee.noShow,
            voiceSeconds: Math.round( attendee.voiceMs / MS_PER_SECOND ),
            sessionStartedAt: null === attendee.sessionStartedAt ? null : new Date( attendee.sessionStartedAt )
        } );
    }

    private toAttendeeState( row: PrismaBot.GuildEventAttendee ): IGuildEventAttendeeState {
        return {
            userId: row.userId,
            interested: row.interested,
            checkedInAt: row.checkedInAt?.getTime() ?? null,
            late: row.late,
            noShow: row.noShow,
            voiceMs: row.voiceSeconds * MS_PER_SECOND,
            sessionStartedAt: row.sessionStartedAt?.getTime() ?? null
        };
    }

    private createRunState( row: PrismaBot.GuildEventRun, settings: IGuildEventsSettingsView ): IGuildEventRunState {
        return {
            runId: row.id,
            guildId: row.guildId,
            scheduledEventId: row.scheduledEventId,
            occurrenceStartAt: row.occurrenceStartAt.getTime(),
            name: row.name,
            voiceChannelId: row.voiceChannelId,
            postChannelId: row.postChannelId,
            phase: GUILD_EVENT_RUN_PHASES.RUNNING === row.phase ? GUILD_EVENT_RUN_PHASES.RUNNING : GUILD_EVENT_RUN_PHASES.CHECK_IN,
            boardMessageId: row.boardMessageId,
            subPostMessageId: row.subPostMessageId,
            subsNeeded: row.subsNeeded,
            frozenAt: row.frozenAt?.getTime() ?? null,
            lastError: row.lastError,
            settings,
            rosterIds: new Set(),
            names: new Map(),
            attendees: new Map(),
            watchedChannelIds: new Set( [ row.voiceChannelId ] ),
            roomSource: null,
            wasActive: false,
            emptySince: null,
            boardHash: null,
            subPostHash: null,
            lastBoardEditAt: 0,
            boardEditTimer: null
        };
    }

    /**
     * Function toClockEvent() :: A scheduled event as the clock sees it, or null for one it has nothing to do with.
     *
     * Only voice and stage events: an external one has no voice channel to check in to.
     */
    private toClockEvent( event: GuildScheduledEvent ): IGuildEventClockEvent | null {
        const isVoice = GuildScheduledEventEntityType.Voice === event.entityType ||
            GuildScheduledEventEntityType.StageInstance === event.entityType;

        if ( ! isVoice || ! event.channelId || null === event.scheduledStartTimestamp ) {
            return null;
        }

        return {
            status: event.status,
            scheduledStartAt: event.scheduledStartTimestamp,
            scheduledEndAt: event.scheduledEndTimestamp
        };
    }

    private toClockRun( run: IGuildEventRunState ) {
        return {
            phase: run.phase,
            occurrenceStartAt: run.occurrenceStartAt,
            frozenAt: run.frozenAt,
            wasActive: run.wasActive,
            emptySince: run.emptySince,
            hasAttendance: [ ... run.attendees.values() ].some( ( attendee ) => null !== attendee.checkedInAt )
        };
    }

    private toDisplayName( name: string ) {
        return NAME_BRACE_REPLACEMENTS.reduce( ( result, [ brace, lookAlike ] ) => result.replaceAll( brace, lookAlike ), name );
    }

    private hash( args: UIArgs ) {
        return crypto.createHash( GUILD_EVENTS_HASH_ALGORITHM ).update( JSON.stringify( args ) ).digest( "hex" );
    }

    private getGuild( guildId: string ): Guild | undefined {
        return this.services.appService.getClient()?.guilds.cache.get( guildId );
    }

    private getPostChannel( guild: Guild, channelId: string | null ): TextChannel | null {
        const channel = channelId ? guild.channels.cache.get( channelId ) : undefined;

        return channel && ChannelType.GuildText === channel.type ? channel : null;
    }

    private getAdapter( adapterName: string ) {
        return ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).get( adapterName, true );
    }

    private isForbidden( error: unknown ) {
        return error instanceof DiscordAPIError && "number" === typeof error.code && FORBIDDEN_CODES.includes( error.code );
    }

    private hasCode( error: unknown, code: number ) {
        return error instanceof DiscordAPIError && error.code === code;
    }
}

export default GuildEventsService;
