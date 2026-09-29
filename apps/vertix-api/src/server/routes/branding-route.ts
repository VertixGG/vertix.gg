import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GUILD_BRANDING_REQUEST_BODY_LIMIT_BYTES } from "@vertix.gg/definitions/src/guild-branding-definitions";

import { RouteBase } from "@vertix.gg/api/src/bases/route-base";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import {
    GUILD_BRANDING_SAVE_CODES,
    readGuildBrandingPatch
} from "@vertix.gg/api/src/server/services/guild-branding-service";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

import type {
    GuildBrandingService,
    TGuildBrandingSaveResult
} from "@vertix.gg/api/src/server/services/guild-branding-service";

interface GuildParams {
    guildId: string;
}

interface SaveQuery {
    /** `false` saves without asking the bot to apply - the first half of a save split in two. */
    apply?: string;
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
 */
function replySaveResult( result: TGuildBrandingSaveResult, reply: FastifyReply ) {
    switch ( result.code ) {
        case GUILD_BRANDING_SAVE_CODES.SAVED:
            return reply.send( { ... result.view, apply: result.apply } );

        case GUILD_BRANDING_SAVE_CODES.INVALID:
            return reply.status( 400 ).send( { error: "Invalid profile", reasons: result.reasons } );

        case GUILD_BRANDING_SAVE_CODES.NOT_ENTITLED:
            return reply.status( 403 ).send( {
                error: "Not on Pro",
                message: "The bot's own profile in your server is part of Pro."
            } );

        case GUILD_BRANDING_SAVE_CODES.BOT_UNREACHABLE:
            return reply.status( 503 ).send( {
                error: "Bot unreachable",
                message: "The bot could not be reached to check your plan. Try again in a minute."
            } );
    }
}

/**
 * The bot's profile in one server - name, avatar, banner and bio - as the dashboard edits it.
 */
export class BrandingRoute extends RouteBase {
    private brandingService: GuildBrandingService | null = null;

    public static getName(): string {
        return "VertixAPI/Routes/Branding";
    }

    protected async initialize(): Promise<void> {
        this.logger.info( this.initialize, "Branding route initialized" );
    }

    private getService(): GuildBrandingService {
        if ( !this.brandingService ) {
            this.brandingService = ServiceLocator.$.get<GuildBrandingService>( "VertixAPI/Services/GuildBranding" )!;
        }

        return this.brandingService;
    }

    public async handleGetBranding(
        request: FastifyRequest<{ Params: GuildParams }>,
        reply: FastifyReply
    ) {
        try {
            return await this.getService().getBranding( request.params.guildId );
        } catch( error ) {
            handleError( this.handleGetBranding, error, reply, "Failed to fetch the server profile" );
        }
    }

    public async handleSaveBranding(
        request: FastifyRequest<{ Params: GuildParams; Querystring: SaveQuery; Body: unknown }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.session.userId;

            if ( !userId ) {
                return reply.status( 401 ).send( { error: "User not authenticated" } );
            }

            const patch = readGuildBrandingPatch( request.body );

            if ( !patch ) {
                return reply.status( 400 ).send( { error: "Invalid profile", reasons: [ "The request is not a profile." ] } );
            }

            const result = await this.getService().saveBranding( request.params.guildId, userId, patch, {
                apply: "false" !== request.query.apply
            } );

            return replySaveResult( result, reply );
        } catch( error ) {
            handleError( this.handleSaveBranding, error, reply, "Failed to save the server profile" );
        }
    }

    public async handleRemoveBranding(
        request: FastifyRequest<{ Params: GuildParams }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.session.userId;

            if ( !userId ) {
                return reply.status( 401 ).send( { error: "User not authenticated" } );
            }

            return replySaveResult( await this.getService().removeBranding( request.params.guildId, userId ), reply );
        } catch( error ) {
            handleError( this.handleRemoveBranding, error, reply, "Failed to remove the server profile" );
        }
    }

    protected registerRoutes( fastify: FastifyInstance ): void {
        fastify.addHook( "preHandler", requireGuildAccess );

        fastify.get<{ Params: GuildParams }>(
            "/management/guild/:guildId/branding",
            this.handleGetBranding.bind( this )
        );

        // Its own body limit rather than a raised global one: this is the one route that takes an
        // image, and it takes one at a time.
        fastify.put<{ Params: GuildParams; Querystring: SaveQuery; Body: unknown }>(
            "/management/guild/:guildId/branding",
            { bodyLimit: GUILD_BRANDING_REQUEST_BODY_LIMIT_BYTES },
            this.handleSaveBranding.bind( this )
        );

        fastify.delete<{ Params: GuildParams }>(
            "/management/guild/:guildId/branding",
            this.handleRemoveBranding.bind( this )
        );
    }
}

const brandingRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    const brandingRoute = ServiceLocator.$.get<BrandingRoute>( "VertixAPI/Routes/Branding" );

    brandingRoute.register( fastify );
};

export default brandingRoutePlugin;
