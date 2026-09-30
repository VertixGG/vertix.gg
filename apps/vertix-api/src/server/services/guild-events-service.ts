import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { GuildEventRunModel } from "@vertix.gg/data/src/models/guild-event-run-model";
import { GuildEventSettingsModel } from "@vertix.gg/data/src/models/guild-event-settings-model";

import { IPC_CHANNELS, IPC_REQUEST_ACTIONS } from "@vertix.gg/definitions/src/ipc-definitions";

import {
    GUILD_EVENT_ATTENDANCE_KINDS,
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_DASHBOARD,
    GUILD_EVENTS_LIMITS,
    GUILD_EVENTS_NUMBER_SETTINGS,
    GUILD_EVENTS_SAVE_CODES,
    isGuildEventsSettingChoice,
    resolveGuildEventAttendanceKind,
    resolveGuildEventsSettings
} from "@vertix.gg/definitions/src/guild-events-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

import type {
    GetGuildEventsStatusRequest,
    GetGuildEventsStatusResponse
} from "@vertix.gg/definitions/src/ipc-definitions";

import type {
    IGuildEventAttendeeView,
    IGuildEventRunDetail,
    IGuildEventRunSummary,
    IGuildEventRunsPage,
    IGuildEventsSettingsPatch,
    IGuildEventsSettingsView,
    TGuildEventAttendanceCounts,
    TGuildEventAttendanceKind,
    TGuildEventRunPhase
} from "@vertix.gg/definitions/src/guild-events-definitions";

/** A discord id, as a picked channel has to be one. */
const SNOWFLAKE_PATTERN = /^\d{17,20}$/;

/** A run's id - a mongo object id, which prisma refuses to look up in any other shape. */
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

const MS_PER_SECOND = 1000;

/** Where a permission flag's words meet - `SendMessages` is shown as `Send Messages`. */
const PERMISSION_WORD_BOUNDARY = /([a-z])([A-Z])/g;

const RUN_PHASES: readonly string[] = Object.values( GUILD_EVENT_RUN_PHASES );

function isRunPhase( phase: string ): phase is TGuildEventRunPhase {
    return RUN_PHASES.includes( phase );
}

function isSnowflake( value: unknown ): value is string {
    return "string" === typeof value && SNOWFLAKE_PATTERN.test( value );
}

/** The settings that are on or off. */
const SWITCH_SETTINGS = [ "enabled", "subPostsEnabled", "checkInPingInterested" ] as const;

/** The settings that name a channel, a role, or nothing. */
const ID_SETTINGS = [ "channelId", "logChannelId", "checkInRoleId", "subRoleId" ] as const;

/** What a refused channel is to Events - the one its boards go to, or the one the attendance is copied to. */
export type TGuildEventsChannelUse = "posts" | "log";

export type TGuildEventsSaveResult =
    | { code: typeof GUILD_EVENTS_SAVE_CODES.SAVED; view: IGuildEventsSettingsView }
    | { code: typeof GUILD_EVENTS_SAVE_CODES.INVALID; reasons: string[] }
    | { code: typeof GUILD_EVENTS_SAVE_CODES.BOT_NOT_IN_GUILD }
    | { code: typeof GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN; channel: TGuildEventsChannelUse; reasons: string[] }
    | { code: typeof GUILD_EVENTS_SAVE_CODES.ROLE_NOT_PINGABLE; reasons: string[] }
    | { code: typeof GUILD_EVENTS_SAVE_CODES.BOT_UNREACHABLE };

/**
 * Function readGuildEventsSettingsPatch() :: A save's body as a patch, or null when it is not one.
 *
 * The body is whatever was sent, so every field is checked for its type before anything reads it -
 * and every number against the values the dashboard offers, the only ones the bot is built to run on.
 */
export function readGuildEventsSettingsPatch( body: unknown ): IGuildEventsSettingsPatch | null {
    if ( "object" !== typeof body || null === body || Array.isArray( body ) ) {
        return null;
    }

    const fields: Record<string, unknown> = { ... body },
        patch: IGuildEventsSettingsPatch = {};

    for ( const setting of SWITCH_SETTINGS ) {
        const value = fields[ setting ];

        if ( undefined === value ) {
            continue;
        }

        if ( "boolean" !== typeof value ) {
            return null;
        }

        patch[ setting ] = value;
    }

    for ( const setting of ID_SETTINGS ) {
        const value = fields[ setting ];

        if ( undefined === value ) {
            continue;
        }

        if ( null !== value && ! isSnowflake( value ) ) {
            return null;
        }

        patch[ setting ] = value;
    }

    for ( const setting of GUILD_EVENTS_NUMBER_SETTINGS ) {
        const value = fields[ setting ];

        if ( undefined === value ) {
            continue;
        }

        if ( ! isGuildEventsSettingChoice( setting, value ) ) {
            return null;
        }

        patch[ setting ] = value;
    }

    if ( undefined !== fields.eventChannelIds ) {
        const value = fields.eventChannelIds;

        if ( ! Array.isArray( value ) || value.length > GUILD_EVENTS_LIMITS.EVENT_CHANNELS_MAX || ! value.every( isSnowflake ) ) {
            return null;
        }

        patch.eventChannelIds = [ ... new Set( value ) ];
    }

    return patch;
}

/**
 * The dashboard's side of Events: its settings, and the attendance of every run.
 *
 * The settings are the same row `/setup` -> Events writes, and are saved the same way: the bot is
 * asked whether it can post in the channel picked, and whichever bot answers is the one the save
 * makes run Events in the server. The history is read straight from the runs the bot stored.
 */
export class GuildEventsService extends ServiceWithDependenciesBase<{
    ipcService: IPCService;
}> {
    public static getName(): string {
        return "VertixAPI/Services/GuildEvents";
    }

    public getDependencies() {
        return {
            ipcService: "VertixBase/Modules/IPCService"
        };
    }

    public async getSettings( guildId: string ): Promise<IGuildEventsSettingsView> {
        return resolveGuildEventsSettings( await GuildEventSettingsModel.$.get( guildId ) );
    }

    /**
     * Function saveSettings() :: Change a server's Events settings, on the bot's word.
     *
     * The same rules as the screen in discord: clearing the channel turns Events off, it cannot be
     * turned on without one, and a channel is only accepted once the bot says it can post there -
     * checked when it is picked and again when Events is turned on, since permissions change. The
     * channel the attendance is copied to is held to the same, and a role only once the bot says a
     * ping of it would reach anybody.
     */
    public async saveSettings( guildId: string, patch: IGuildEventsSettingsPatch, userId: string ): Promise<TGuildEventsSaveResult> {
        const current = resolveGuildEventsSettings( await GuildEventSettingsModel.$.get( guildId ) ),
            next = { ... current, ... patch },
            isTurningOn = true === patch.enabled;

        const invalid = this.findInvalid( guildId, patch, next );

        if ( invalid ) {
            return { code: GUILD_EVENTS_SAVE_CODES.INVALID, reasons: [ invalid ] };
        }

        // Asked about only what is being picked, and - when Events is being turned on - every channel
        // it will post in, since permissions change after a channel is picked.
        const postsChannelId = next.channelId && ( undefined !== patch.channelId || isTurningOn ) ? next.channelId : null,
            logChannelId = next.logChannelId && ( undefined !== patch.logChannelId || isTurningOn ) ? next.logChannelId : null,
            roleIds = [ patch.checkInRoleId, patch.subRoleId ].filter( ( roleId ): roleId is string => !! roleId );

        const status = await this.getStatus(
            guildId,
            [ postsChannelId, logChannelId ].filter( ( channelId ): channelId is string => !! channelId ),
            [ ... new Set( roleIds ) ]
        );

        if ( ! status ) {
            return { code: GUILD_EVENTS_SAVE_CODES.BOT_UNREACHABLE };
        }

        if ( ! status.isBotInGuild ) {
            return { code: GUILD_EVENTS_SAVE_CODES.BOT_NOT_IN_GUILD };
        }

        for ( const [ channelId, channel ] of [ [ postsChannelId, "posts" ], [ logChannelId, "log" ] ] as const ) {
            const missingPermissions = channelId ? status.channels[ channelId ] : [];

            if ( ! missingPermissions ) {
                return { code: GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN, channel, reasons: [ "That is not a text channel the bot can see." ] };
            }

            if ( missingPermissions.length ) {
                return {
                    code: GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN,
                    channel,
                    reasons: missingPermissions.map( ( permission ) => permission.replace( PERMISSION_WORD_BOUNDARY, "$1 $2" ) )
                };
            }
        }

        for ( const roleId of roleIds ) {
            const role = status.roles[ roleId ];

            if ( ! role ) {
                return { code: GUILD_EVENTS_SAVE_CODES.INVALID, reasons: [ "That role is not in the server any more." ] };
            }

            if ( ! role.isPingable ) {
                return {
                    code: GUILD_EVENTS_SAVE_CODES.ROLE_NOT_PINGABLE,
                    reasons: [
                        "Turn on \"Allow anyone to @mention this role\" for it in Server Settings → Roles,",
                        "or give the bot the Mention @everyone, @here and All Roles permission."
                    ]
                };
            }
        }

        const saved = await GuildEventSettingsModel.$.save( guildId, status.applicationId, {
            ... patch,
            // Clearing the channel turns Events off: there would be nowhere for a board to go.
            enabled: null !== next.channelId && next.enabled
        }, userId );

        return { code: GUILD_EVENTS_SAVE_CODES.SAVED, view: resolveGuildEventsSettings( saved ) };
    }

    /**
     * Function getRuns() :: One page of a server's history, newest first, or null for a cursor that
     * is not one.
     */
    public async getRuns( guildId: string, cursor: string ): Promise<IGuildEventRunsPage | null> {
        const afterRunId = GUILD_EVENTS_DASHBOARD.FIRST_PAGE_CURSOR === cursor ? null : cursor;

        if ( null !== afterRunId && ! OBJECT_ID_PATTERN.test( afterRunId ) ) {
            return null;
        }

        const limit = GUILD_EVENTS_DASHBOARD.HISTORY_PAGE_SIZE,
            rows = await GuildEventRunModel.$.getPage( guildId, afterRunId, limit ),
            page = rows.slice( 0, limit ),
            attendees = page.length ? await GuildEventRunModel.$.getAttendeesForRuns( page.map( ( run ) => run.id ) ) : [],
            now = Date.now();

        return {
            runs: page.map( ( run ) => this.toSummary( run, attendees.filter( ( attendee ) => attendee.runId === run.id ), now ) ),
            nextCursor: rows.length > limit ? page[ page.length - 1 ].id : null
        };
    }

    /**
     * Function getRun() :: One run's attendance, or null for a run that is not the server's.
     */
    public async getRun( guildId: string, runId: string ): Promise<IGuildEventRunDetail | null> {
        if ( ! OBJECT_ID_PATTERN.test( runId ) ) {
            return null;
        }

        const run = await GuildEventRunModel.$.getInGuild( guildId, runId );

        if ( ! run ) {
            return null;
        }

        const attendees = await GuildEventRunModel.$.getAttendees( run.id ),
            now = Date.now();

        return {
            ... this.toSummary( run, attendees, now ),
            attendees: this.toAttendeeViews( run, attendees, now )
        };
    }

    /**
     * Function findInvalid() :: Why a change makes no sense, before anybody is asked about it.
     */
    private findInvalid( guildId: string, patch: IGuildEventsSettingsPatch, next: IGuildEventsSettingsView ) {
        if ( true === patch.enabled && null === next.channelId ) {
            return "Pick a channel for Events to post in first.";
        }

        if ( next.logChannelId && next.logChannelId === next.channelId &&
            ( undefined !== patch.logChannelId || undefined !== patch.channelId ) ) {
            return "The attendance copy needs a channel of its own - the boards already end as the attendance there.";
        }

        // `@everyone` carries the server's own id, and is not a role a ping can name.
        if ( guildId === patch.checkInRoleId || guildId === patch.subRoleId ) {
            return "Pick a role - Events does not ping @everyone.";
        }

        return null;
    }

    /**
     * Function getStatus() :: The bot's word on a server, its channels and its roles, or null if it could not be asked.
     */
    private async getStatus( guildId: string, channelIds: string[], roleIds: string[] ): Promise<GetGuildEventsStatusResponse | null> {
        if ( ! this.services.ipcService.isReady() ) {
            return null;
        }

        try {
            return await this.services.ipcService.request<GetGuildEventsStatusRequest, GetGuildEventsStatusResponse>(
                IPC_CHANNELS.MANAGEMENT_REQUEST,
                IPC_CHANNELS.MANAGEMENT_RESPONSE,
                { action: IPC_REQUEST_ACTIONS.GET_GUILD_EVENTS_STATUS, guildId, channelIds, roleIds },
                GUILD_EVENTS_DASHBOARD.STATUS_REQUEST_TIMEOUT_MS
            );
        } catch( error ) {
            this.logger.warn( this.getStatus, `Guild id: '${ guildId }' - Could not ask the bot about Events`, error );

            return null;
        }
    }

    private toSummary( run: PrismaBot.GuildEventRun, attendees: PrismaBot.GuildEventAttendee[], now: number ): IGuildEventRunSummary {
        const counts: TGuildEventAttendanceCounts = {
            [ GUILD_EVENT_ATTENDANCE_KINDS.CAME ]: 0,
            [ GUILD_EVENT_ATTENDANCE_KINDS.LATE ]: 0,
            [ GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW ]: 0,
            [ GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN ]: 0
        };

        for ( const attendee of this.toAttendeeViews( run, attendees, now ) ) {
            counts[ attendee.kind ]++;
        }

        return {
            id: run.id,
            name: run.name,
            occurrenceStartAt: run.occurrenceStartAt.toISOString(),
            endedAt: run.endedAt?.toISOString() ?? null,
            phase: this.toPhase( run.phase ),
            voiceChannelId: run.voiceChannelId,
            counts
        };
    }

    /**
     * Function toAttendeeViews() :: Everybody the attendance has something to say about, longest in voice first.
     *
     * While check-in is still open nobody is on the roster yet - it is written when it freezes - so
     * whoever is there so far is counted as having come. A visit still going is counted up to now.
     * A finished run is held to the least time in voice it ended with, the way its board was.
     */
    private toAttendeeViews( run: PrismaBot.GuildEventRun, attendees: PrismaBot.GuildEventAttendee[], now: number ): IGuildEventAttendeeView[] {
        const isCheckingIn = GUILD_EVENT_RUN_PHASES.CHECK_IN === run.phase,
            minVoiceSeconds = GUILD_EVENT_RUN_PHASES.ENDED === run.phase ? run.minVoiceSeconds ?? 0 : 0,
            views: IGuildEventAttendeeView[] = [];

        for ( const attendee of attendees ) {
            const openSeconds = attendee.sessionStartedAt
                    ? Math.max( 0, Math.floor( ( now - attendee.sessionStartedAt.getTime() ) / MS_PER_SECOND ) )
                    : 0,
                voiceSeconds = attendee.voiceSeconds + openSeconds;

            const kind: TGuildEventAttendanceKind | null = resolveGuildEventAttendanceKind( {
                interested: attendee.interested || isCheckingIn,
                hasCheckedIn: null !== attendee.checkedInAt,
                late: attendee.late,
                voiceSeconds,
                minVoiceSeconds
            } );

            if ( ! kind ) {
                continue;
            }

            views.push( {
                userId: attendee.userId,
                displayName: attendee.displayName,
                kind,
                voiceSeconds,
                checkedInAt: attendee.checkedInAt?.toISOString() ?? null
            } );
        }

        return views.sort( ( a, b ) => b.voiceSeconds - a.voiceSeconds );
    }

    private toPhase( phase: string ): TGuildEventRunPhase {
        return isRunPhase( phase ) ? phase : GUILD_EVENT_RUN_PHASES.ENDED;
    }
}

export default GuildEventsService;
