import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GUILD_EVENTS_SAVE_CODES } from "@vertix.gg/definitions/src/guild-events-definitions";

import { RouteBase } from "@vertix.gg/api/src/bases/route-base";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import { readGuildEventsSettingsPatch } from "@vertix.gg/api/src/server/services/guild-events-service";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

import type {
    GuildEventsService,
    TGuildEventsSaveResult
} from "@vertix.gg/api/src/server/services/guild-events-service";

interface GuildParams {
    guildId: string;
}

interface RunsParams extends GuildParams {
    cursor: string;
}

interface RunParams extends GuildParams {
    runId: string;
}

/**
 * Middleware to verify user has access to the requested guild.
 * Checks that the guildId in params matches the user's selected guild in session.
 */
async function requireGuildAccess(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    const { guildId } = request.params;
    const selectedGuild = request.session.selectedGuild;

    if ( !selectedGuild || selectedGuild.id !== guildId ) {
        return reply.status( 403 ).send( { error: "Access denied" } );
    }
}

/**
 * Function replySaveResult() :: A save answered with the status that says what became of it.
 *
 * The code travels with every refusal, so the dashboard can word each one itself.
 */
function replySaveResult( result: TGuildEventsSaveResult, reply: FastifyReply ) {
    switch ( result.code ) {
        case GUILD_EVENTS_SAVE_CODES.SAVED:
            return reply.send( result.view );

        case GUILD_EVENTS_SAVE_CODES.INVALID:
            return reply.status( 400 ).send( { error: "Invalid settings", code: result.code, reasons: result.reasons } );

        case GUILD_EVENTS_SAVE_CODES.CHANNEL_FORBIDDEN:
            return reply.status( 400 ).send( {
                error: "The bot cannot post in that channel",
                code: result.code,
                reasons: result.reasons
            } );

        case GUILD_EVENTS_SAVE_CODES.BOT_NOT_IN_GUILD:
            return reply.status( 409 ).send( {
                error: "The bot is not in this server",
                code: result.code,
                message: "Add the bot to the server before turning Events on."
            } );

        case GUILD_EVENTS_SAVE_CODES.BOT_UNREACHABLE:
            return reply.status( 503 ).send( {
                error: "Bot unreachable",
                code: result.code,
                message: "The bot could not be reached to check the channel. Try again in a minute."
            } );
    }
}

/**
 * Events as the dashboard sees it - its settings, and the attendance of every run.
 */
export class EventsRoute extends RouteBase {
    private eventsService: GuildEventsService | null = null;

    public static getName(): string {
        return "VertixAPI/Routes/Events";
    }

    protected async initialize(): Promise<void> {
        this.logger.info( this.initialize, "Events route initialized" );
    }

    private getService(): GuildEventsService {
        if ( !this.eventsService ) {
            this.eventsService = ServiceLocator.$.get<GuildEventsService>( "VertixAPI/Services/GuildEvents" )!;
        }

        return this.eventsService;
    }

    public async handleGetSettings(
        request: FastifyRequest<{ Params: GuildParams }>,
        reply: FastifyReply
    ) {
        try {
            return await this.getService().getSettings( request.params.guildId );
        } catch( error ) {
            handleError( this.handleGetSettings, error, reply, "Failed to fetch the Events settings" );
        }
    }

    public async handleSaveSettings(
        request: FastifyRequest<{ Params: GuildParams; Body: unknown }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.session.userId;

            if ( !userId ) {
                return reply.status( 401 ).send( { error: "User not authenticated" } );
            }

            const patch = readGuildEventsSettingsPatch( request.body );

            if ( !patch ) {
                return reply.status( 400 ).send( {
                    error: "Invalid settings",
                    code: GUILD_EVENTS_SAVE_CODES.INVALID,
                    reasons: [ "The request is not a change to the Events settings." ]
                } );
            }

            return replySaveResult( await this.getService().saveSettings( request.params.guildId, patch, userId ), reply );
        } catch( error ) {
            handleError( this.handleSaveSettings, error, reply, "Failed to save the Events settings" );
        }
    }

    public async handleGetRuns(
        request: FastifyRequest<{ Params: RunsParams }>,
        reply: FastifyReply
    ) {
        try {
            const page = await this.getService().getRuns( request.params.guildId, request.params.cursor );

            if ( !page ) {
                return reply.status( 400 ).send( { error: "Invalid cursor" } );
            }

            return page;
        } catch( error ) {
            handleError( this.handleGetRuns, error, reply, "Failed to fetch the Events history" );
        }
    }

    public async handleGetRun(
        request: FastifyRequest<{ Params: RunParams }>,
        reply: FastifyReply
    ) {
        try {
            const run = await this.getService().getRun( request.params.guildId, request.params.runId );

            if ( !run ) {
                return reply.status( 404 ).send( { error: "Event not found" } );
            }

            return run;
        } catch( error ) {
            handleError( this.handleGetRun, error, reply, "Failed to fetch the event's attendance" );
        }
    }

    protected registerRoutes( fastify: FastifyInstance ): void {
        fastify.addHook( "preHandler", requireGuildAccess );

        fastify.get<{ Params: GuildParams }>(
            "/management/guild/:guildId/events/settings",
            this.handleGetSettings.bind( this )
        );

        fastify.put<{ Params: GuildParams; Body: unknown }>(
            "/management/guild/:guildId/events/settings",
            this.handleSaveSettings.bind( this )
        );

        // The page is a path segment rather than a query: the dashboard's client fills in path
        // parameters and sends no query string with a read.
        fastify.get<{ Params: RunsParams }>(
            "/management/guild/:guildId/events/runs/:cursor",
            this.handleGetRuns.bind( this )
        );

        fastify.get<{ Params: RunParams }>(
            "/management/guild/:guildId/events/run/:runId",
            this.handleGetRun.bind( this )
        );
    }
}

const eventsRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    const eventsRoute = ServiceLocator.$.get<EventsRoute>( "VertixAPI/Routes/Events" );

    eventsRoute.register( fastify );
};

export default eventsRoutePlugin;
