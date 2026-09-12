import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { IPC_CHANNELS } from "@vertix.gg/definitions/src/ipc-definitions";

import { DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import {
    DEFAULT_GUILD_ID,
    getGuildCustomization,
    updateComponentCustomization,
    deleteComponentCustomization
} from "@vertix.gg/api/src/server/services/customization-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import type { ComponentCustomization } from "@vertix.gg/definitions/src/ui-customization-definitions";

const logger = new Logger( "VertixAPI/CustomizationRoute" );

interface GuildParams {
    guildId: string;
}

interface ComponentBody {
    /** The component's own name, as `getName()` returns it. */
    component: string;
    /** The state it is narrowed to, or null/absent for every state. */
    state?: string | null;
    /** The language it is narrowed to, or null/absent for every language. */
    language?: string | null;
    /** The generator it is narrowed to, by discord id, or null/absent for the whole guild. */
    masterChannelId?: string | null;
    customization: ComponentCustomization;
}

interface DeleteComponentBody {
    component: string;
    state?: string | null;
    language?: string | null;
    masterChannelId?: string | null;
}

/**
 * Notify the bot process to refresh customization for a guild via IPC.
 * Fire-and-forget — IPC failure does not affect the API response.
 */
async function notifyBotCustomizationRefresh( guildId: string ) {
    try {
        const ipcService = ServiceLocator.$.get<IPCService>( "VertixBase/Modules/IPCService" );

        if ( !ipcService ) {
            logger.warn( notifyBotCustomizationRefresh, `IPC service not found in ServiceLocator for guild ${ guildId }` );
            return;
        }

        if ( !ipcService.isReady() ) {
            logger.warn( notifyBotCustomizationRefresh, `IPC service not ready for guild ${ guildId }` );
            return;
        }

        await ipcService.publish( IPC_CHANNELS.MANAGEMENT, {
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.REFRESH_CUSTOMIZATION,
            data: { guildId }
        } );

        logger.info( notifyBotCustomizationRefresh, `Published REFRESH_CUSTOMIZATION for guild ${ guildId }` );
    } catch( error ) {
        logger.error( notifyBotCustomizationRefresh, `Failed to notify bot for guild ${ guildId }`, error );
    }
}

/**
 * Middleware to verify user has access to the requested guild.
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
 * Middleware to verify user is the bot owner.
 */
async function requireOwnerAccess(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if ( !request.session.userId || request.session.userId !== process.env.OWNERD_ID ) {
        return reply.status( 403 ).send( { error: "Owner access required" } );
    }
}

/**
 * GET /customization/guild/:guildId
 * Get all customizations for a guild.
 */
async function handleGetGuildCustomization(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;
        return { guildId, rows: await getGuildCustomization( guildId ) };
    } catch( error ) {
        handleError( handleGetGuildCustomization, error, reply, "Failed to fetch guild customization" );
    }
}

/**
 * PUT /customization/guild/:guildId/component
 * Update a single component's customization.
 * customizationKey is sent in body to avoid URL encoding issues with slashes.
 */
async function handleUpdateComponentCustomization(
    request: FastifyRequest<{ Params: GuildParams; Body: ComponentBody }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;
        const { component, state, language, masterChannelId, customization } = request.body;

        if ( !component || typeof component !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "component is required" } );
        }

        if ( !customization || typeof customization !== "object" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customization object is required" } );
        }

        const result = await updateComponentCustomization(
            guildId,
            { component, state, language, masterChannelId },
            customization
        );

        // Notify bot to refresh active sessions with updated customization
        notifyBotCustomizationRefresh( guildId );

        return result;
    } catch( error ) {
        handleError( handleUpdateComponentCustomization, error, reply, "Failed to update component customization" );
    }
}

/**
 * DELETE /customization/guild/:guildId/component
 * Delete a component's customization.
 * customizationKey is sent in body to avoid URL encoding issues with slashes.
 */
async function handleDeleteComponentCustomization(
    request: FastifyRequest<{ Params: GuildParams; Body: DeleteComponentBody }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;
        const { component, state, language, masterChannelId } = request.body;

        if ( !component || typeof component !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "component is required" } );
        }

        const result = await deleteComponentCustomization( guildId, { component, state, language, masterChannelId } );

        if ( !result ) {
            return reply.status( 404 ).send( { error: "Not found", message: "No customization found for this guild" } );
        }

        return result;
    } catch( error ) {
        handleError( handleDeleteComponentCustomization, error, reply, "Failed to delete component customization" );
    }
}

// --- Default customization handlers (owner-only) ---

/**
 * GET /customization/default
 * Get default customizations (owner only).
 */
async function handleGetDefaultCustomization(
    _request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const customization = await getGuildCustomization( DEFAULT_GUILD_ID );
        return { guildId: DEFAULT_GUILD_ID, rows: customization };
    } catch( error ) {
        handleError( handleGetDefaultCustomization, error, reply, "Failed to fetch default customization" );
    }
}

/**
 * PUT /customization/default/component
 * Update a single component's default customization (owner only).
 */
async function handleUpdateDefaultComponentCustomization(
    request: FastifyRequest<{ Body: ComponentBody }>,
    reply: FastifyReply
) {
    try {
        const { component, state, language, customization } = request.body;

        if ( !component || typeof component !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "component is required" } );
        }

        if ( !customization || typeof customization !== "object" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customization object is required" } );
        }

        const result = await updateComponentCustomization( DEFAULT_GUILD_ID, { component, state, language }, customization );

        // Notify bot to refresh — __default__ affects all guilds
        notifyBotCustomizationRefresh( DEFAULT_GUILD_ID );

        return result;
    } catch( error ) {
        handleError( handleUpdateDefaultComponentCustomization, error, reply, "Failed to update default component customization" );
    }
}

/**
 * DELETE /customization/default/component
 * Delete a component's default customization (owner only).
 */
async function handleDeleteDefaultComponentCustomization(
    request: FastifyRequest<{ Body: DeleteComponentBody }>,
    reply: FastifyReply
) {
    try {
        const { component, state, language } = request.body;

        if ( !component || typeof component !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "component is required" } );
        }

        const result = await deleteComponentCustomization( DEFAULT_GUILD_ID, { component, state, language } );

        if ( !result ) {
            return reply.status( 404 ).send( { error: "Not found", message: "No default customization found" } );
        }

        return result;
    } catch( error ) {
        handleError( handleDeleteDefaultComponentCustomization, error, reply, "Failed to delete default component customization" );
    }
}

const customizationRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    // Guild-specific customization routes (require guild access)
    fastify.register( async( guildRoutes ) => {
        guildRoutes.addHook( "preHandler", requireGuildAccess );

        // Get all customizations for a guild
        guildRoutes.get<{ Params: GuildParams }>(
            "/customization/guild/:guildId",
            handleGetGuildCustomization
        );

        // Update a single component's customization
        guildRoutes.put<{ Params: GuildParams; Body: ComponentBody }>(
            "/customization/guild/:guildId/component",
            handleUpdateComponentCustomization
        );

        // Delete a component's customization
        guildRoutes.delete<{ Params: GuildParams; Body: DeleteComponentBody }>(
            "/customization/guild/:guildId/component",
            handleDeleteComponentCustomization
        );
    } );

    // Default customization routes (require owner access)
    fastify.register( async( defaultRoutes ) => {
        defaultRoutes.addHook( "preHandler", requireOwnerAccess );

        // Get default customizations
        defaultRoutes.get(
            "/customization/default",
            handleGetDefaultCustomization
        );

        // Update a single component's default customization
        defaultRoutes.put<{ Body: ComponentBody }>(
            "/customization/default/component",
            handleUpdateDefaultComponentCustomization
        );

        // Delete a component's default customization
        defaultRoutes.delete<{ Body: DeleteComponentBody }>(
            "/customization/default/component",
            handleDeleteDefaultComponentCustomization
        );
    } );
};

export default customizationRoutePlugin;
