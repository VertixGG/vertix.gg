import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { IPC_CHANNELS, MANAGEMENT_ACTIONS } from "@vertix.gg/base/src/modules/ipc";

import {
    DEFAULT_GUILD_ID,
    getGuildCustomization,
    updateGuildCustomization,
    updateComponentCustomization,
    deleteComponentCustomization
} from "@vertix.gg/api/src/server/services/customization-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import type { ComponentCustomization } from "@vertix.gg/definitions/src/ui-customization-definitions";

interface GuildParams {
    guildId: string;
}

interface ComponentBody {
    customizationKey: string;
    customization: ComponentCustomization;
    languageCode?: string;
}

interface UpdateCustomizationBody {
    components: Record<string, ComponentCustomization>;
}

interface DeleteComponentBody {
    customizationKey: string;
    languageCode?: string;
}

/**
 * Notify the bot process to refresh customization for a guild via IPC.
 * Fire-and-forget — IPC failure does not affect the API response.
 */
async function notifyBotCustomizationRefresh( guildId: string ) {
    try {
        const ipcService = ServiceLocator.$.get<IPCService>( "VertixBase/Modules/IPCService" );

        if ( ipcService?.isReady() ) {
            await ipcService.publish( IPC_CHANNELS.MANAGEMENT, {
                action: MANAGEMENT_ACTIONS.REFRESH_CUSTOMIZATION,
                data: { guildId }
            } );
        }
    } catch {
        // Non-critical: customization is already saved to DB
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
        const customization = await getGuildCustomization( guildId );

        // Return empty components if no customization exists yet
        return customization ?? { guildId, components: {} };
    } catch( error ) {
        handleError( handleGetGuildCustomization, error, reply, "Failed to fetch guild customization" );
    }
}

/**
 * PUT /customization/guild/:guildId
 * Update all customizations for a guild.
 */
async function handleUpdateGuildCustomization(
    request: FastifyRequest<{ Params: GuildParams; Body: UpdateCustomizationBody }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;
        const { components } = request.body;

        if ( !components || typeof components !== "object" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "components object is required" } );
        }

        const customization = await updateGuildCustomization( guildId, components );

        // Notify bot to refresh active sessions with updated customization
        notifyBotCustomizationRefresh( guildId );

        return customization;
    } catch( error ) {
        handleError( handleUpdateGuildCustomization, error, reply, "Failed to update guild customization" );
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
        const { customizationKey, customization, languageCode } = request.body;

        if ( !customizationKey || typeof customizationKey !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customizationKey is required" } );
        }

        if ( !customization || typeof customization !== "object" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customization object is required" } );
        }

        const result = await updateComponentCustomization( guildId, customizationKey, customization, languageCode );

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
        const { customizationKey, languageCode } = request.body;

        if ( !customizationKey || typeof customizationKey !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customizationKey is required" } );
        }

        const result = await deleteComponentCustomization( guildId, customizationKey, languageCode );

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
        return customization ?? { guildId: DEFAULT_GUILD_ID, components: {} };
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
        const { customizationKey, customization, languageCode } = request.body;

        if ( !customizationKey || typeof customizationKey !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customizationKey is required" } );
        }

        if ( !customization || typeof customization !== "object" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customization object is required" } );
        }

        const result = await updateComponentCustomization( DEFAULT_GUILD_ID, customizationKey, customization, languageCode );

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
        const { customizationKey, languageCode } = request.body;

        if ( !customizationKey || typeof customizationKey !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customizationKey is required" } );
        }

        const result = await deleteComponentCustomization( DEFAULT_GUILD_ID, customizationKey, languageCode );

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

        // Update all customizations for a guild
        guildRoutes.put<{ Params: GuildParams; Body: UpdateCustomizationBody }>(
            "/customization/guild/:guildId",
            handleUpdateGuildCustomization
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
