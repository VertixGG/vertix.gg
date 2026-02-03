import {
    getGuildCustomization,
    updateGuildCustomization,
    updateComponentCustomization,
    deleteComponentCustomization
} from "@vertix.gg/api/src/server/services/customization-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import type { ComponentCustomization } from "@vertix.gg/definitions/src/ui-customization-definitions";

interface GuildParams {
    guildId: string;
}

interface ComponentBody {
    customizationKey: string;
    customization: ComponentCustomization;
}

interface UpdateCustomizationBody {
    components: Record<string, ComponentCustomization>;
}

interface DeleteComponentBody {
    customizationKey: string;
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
    } catch ( error ) {
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
        return customization;
    } catch ( error ) {
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
        const { customizationKey, customization } = request.body;

        if ( !customizationKey || typeof customizationKey !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customizationKey is required" } );
        }

        if ( !customization || typeof customization !== "object" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customization object is required" } );
        }

        const result = await updateComponentCustomization( guildId, customizationKey, customization );
        return result;
    } catch ( error ) {
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
        const { customizationKey } = request.body;

        if ( !customizationKey || typeof customizationKey !== "string" ) {
            return reply.status( 400 ).send( { error: "Invalid request", message: "customizationKey is required" } );
        }

        const result = await deleteComponentCustomization( guildId, customizationKey );

        if ( !result ) {
            return reply.status( 404 ).send( { error: "Not found", message: "No customization found for this guild" } );
        }

        return result;
    } catch ( error ) {
        handleError( handleDeleteComponentCustomization, error, reply, "Failed to delete component customization" );
    }
}

const customizationRoutePlugin: FastifyPluginAsync = async ( fastify: FastifyInstance ): Promise<void> => {
    // All customization routes need guild access check
    fastify.register( async ( guildRoutes ) => {
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
};

export default customizationRoutePlugin;
