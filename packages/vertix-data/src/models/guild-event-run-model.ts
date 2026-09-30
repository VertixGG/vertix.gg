import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { GUILD_EVENT_RUN_PHASES } from "@vertix.gg/definitions/src/guild-events-definitions";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import { isUniqueConstraintFailed } from "@vertix.gg/data/src/utils/prisma-errors";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

export interface IGuildEventRunOpen {
    applicationId: string;
    guildId: string;
    scheduledEventId: string;
    occurrenceStartAt: Date;
    name: string;
    voiceChannelId: string;
    postChannelId: string;
}

export type TGuildEventRunPatch = Partial<Pick<PrismaBot.GuildEventRun,
    | "name"
    | "phase"
    | "boardMessageId"
    | "subPostMessageId"
    | "subsNeeded"
    | "frozenAt"
    | "endedAt"
    | "checkpointAt"
    | "lastError"
>>;

export type TGuildEventAttendeePatch = Partial<Pick<PrismaBot.GuildEventAttendee,
    | "displayName"
    | "interested"
    | "checkedInAt"
    | "late"
    | "noShow"
    | "voiceSeconds"
    | "sessionStartedAt"
>>;

/**
 * The occurrences of scheduled events each bot ran, and every member's part in them.
 *
 * Two tables behind one model, like `GuildBrandingModel`: a run and its attendance are one thing
 * written from two sides - the clock moves the run, voice moves the attendance.
 */
export class GuildEventRunModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildEventRunModel;

    public static getName(): string {
        return "VertixData/Models/GuildEventRunModel";
    }

    public static getInstance(): GuildEventRunModel {
        if ( ! GuildEventRunModel.instance ) {
            GuildEventRunModel.instance = new GuildEventRunModel();
        }

        return GuildEventRunModel.instance;
    }

    public static get $() {
        return GuildEventRunModel.getInstance();
    }

    /**
     * Function getOpen() :: Every run this bot has not finished - what it picks up again after a restart.
     */
    public async getOpen( applicationId: string ) {
        return this.prisma.guildEventRun.findMany( {
            where: {
                applicationId,
                phase: { in: [ GUILD_EVENT_RUN_PHASES.CHECK_IN, GUILD_EVENT_RUN_PHASES.RUNNING ] }
            }
        } );
    }

    /**
     * Function open() :: Start the run of one occurrence, or find the one already started.
     *
     * `isCreated` is false when the row was already there - written by this process before a restart,
     * or by another one - and only the process that created a run posts its board.
     */
    public async open( run: IGuildEventRunOpen ) {
        try {
            const created = await this.prisma.guildEventRun.create( {
                data: { ... run, phase: GUILD_EVENT_RUN_PHASES.CHECK_IN }
            } );

            this.debugger.log( this.open, `Guild id: '${ run.guildId }' - Run '${ created.id }' opened` );

            return { run: created, isCreated: true };
        } catch( error ) {
            if ( ! isUniqueConstraintFailed( error ) ) {
                throw error;
            }

            const existing = await this.prisma.guildEventRun.findUniqueOrThrow( {
                where: {
                    applicationId_scheduledEventId_occurrenceStartAt: {
                        applicationId: run.applicationId,
                        scheduledEventId: run.scheduledEventId,
                        occurrenceStartAt: run.occurrenceStartAt
                    }
                }
            } );

            return { run: existing, isCreated: false };
        }
    }

    public async update( runId: string, patch: TGuildEventRunPatch ) {
        return this.prisma.guildEventRun.update( { where: { id: runId }, data: patch } );
    }

    /**
     * Function checkpoint() :: Record that these runs were looked at, at this moment.
     */
    public async checkpoint( runIds: string[], at: Date ) {
        await this.prisma.guildEventRun.updateMany( {
            where: { id: { in: runIds } },
            data: { checkpointAt: at }
        } );
    }

    /**
     * Function close() :: End runs that can no longer be finished, in the database only.
     *
     * For runs in a server the bot has left, or long past the longest a run may last: there is nothing
     * left to post, or nowhere to post it.
     */
    public async close( runIds: string[], at: Date ) {
        this.debugger.log( this.close, `Closing ${ runIds.length } run(s)` );

        await this.prisma.guildEventRun.updateMany( {
            where: { id: { in: runIds } },
            data: { phase: GUILD_EVENT_RUN_PHASES.ENDED, endedAt: at }
        } );
    }

    public async getAttendees( runId: string ) {
        return this.prisma.guildEventAttendee.findMany( { where: { runId } } );
    }

    /**
     * Function getAttendeesForRuns() :: Every member's part in several runs at once - what one page of
     * the history is counted from.
     */
    public async getAttendeesForRuns( runIds: string[] ) {
        return this.prisma.guildEventAttendee.findMany( { where: { runId: { in: runIds } } } );
    }

    /**
     * Function getPage() :: A server's runs, newest first, from after one run onwards.
     *
     * One more than asked for is read, so the caller can tell whether another page follows without a
     * second query. The id breaks ties between occurrences that start at the same moment, which is
     * what lets a run be the cursor.
     *
     * Every bot's runs: only the bot whose setup was last saved runs a server's events, so two bots
     * sharing the database never both have a run of the same occurrence.
     */
    public async getPage( guildId: string, afterRunId: string | null, limit: number ) {
        return this.prisma.guildEventRun.findMany( {
            where: { guildId },
            orderBy: [ { occurrenceStartAt: "desc" }, { id: "desc" } ],
            take: limit + 1,
            ... ( afterRunId ? { cursor: { id: afterRunId }, skip: 1 } : {} )
        } );
    }

    /**
     * Function getInGuild() :: One run, only if it is the server's - a run id from another server
     * answers nothing.
     */
    public async getInGuild( guildId: string, runId: string ) {
        return this.prisma.guildEventRun.findFirst( { where: { id: runId, guildId } } );
    }

    public async saveAttendee( runId: string, guildId: string, userId: string, patch: TGuildEventAttendeePatch ) {
        return this.prisma.guildEventAttendee.upsert( {
            where: { runId_userId: { runId, userId } },
            create: { runId, guildId, userId, ... patch },
            update: patch
        } );
    }

    /**
     * Function freezeRoster() :: Write down who said they would come, once the roster stops following
     * the event.
     *
     * The ones who had come by then already have a row and are only marked as on the roster; the ones
     * who had not are written as not having come, under the name the roster had for them.
     */
    public async freezeRoster(
        runId: string,
        guildId: string,
        rosterIds: string[],
        checkedInIds: string[],
        names: ReadonlyMap<string, string>
    ) {
        const checkedIn = new Set( checkedInIds ),
            missingIds = rosterIds.filter( ( userId ) => ! checkedIn.has( userId ) ),
            presentIds = rosterIds.filter( ( userId ) => checkedIn.has( userId ) );

        if ( presentIds.length ) {
            await this.prisma.guildEventAttendee.updateMany( {
                where: { runId, userId: { in: presentIds } },
                data: { interested: true }
            } );
        }

        if ( missingIds.length ) {
            await this.prisma.guildEventAttendee.createMany( {
                data: missingIds.map( ( userId ) => ( {
                    runId,
                    guildId,
                    userId,
                    displayName: names.get( userId ) ?? null,
                    interested: true,
                    noShow: true
                } ) )
            } );
        }
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildEventRunModel;
