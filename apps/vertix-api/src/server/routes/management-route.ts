import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { RouteBase } from "@vertix.gg/api/src/bases/route-base";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import type { ManagementService, UpdateScalingSettingsInput, UpdateDynamicSettingsInput } from "@vertix.gg/api/src/server/services/management-service";

interface GuildParams {
    guildId: string;
}

interface ScalingMasterParams extends GuildParams {
    masterChannelId: string;
}

interface DynamicMasterParams extends GuildParams {
    masterChannelId: string;
}

interface CreateScalingSetupBody {
    prefix?: string;
    maxMembers?: number;
}

interface CreateDynamicSetupBody {
    version?: "v2" | "v3";
    nameTemplate?: string;
    autoSave?: boolean;
    mentionable?: boolean;
}

interface UpdateScalingSettingsBody {
    scalingChannelPrefix?: string;
    scalingChannelMaxMembersPerChannel?: number;
    scalingChannelMinAvailableChannels?: number;
    scalingChannelCategoryId?: string | null;
}

interface UpdateDynamicSettingsBody {
    dynamicChannelNameTemplate?: string;
    dynamicChannelAutoSave?: boolean;
    dynamicChannelMentionable?: boolean;
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

export class ManagementRoute extends RouteBase {
    private managementService: ManagementService | null = null;

    public static getName(): string {
        return "VertixAPI/Routes/Management";
    }

    protected async initialize(): Promise<void> {
        this.logger.info( this.initialize, "Management route initialized" );
    }

    private getService(): ManagementService {
        if ( !this.managementService ) {
            this.managementService = ServiceLocator.$.get<ManagementService>( "VertixAPI/Services/Management" )!;
        }

        return this.managementService;
    }

    public async handleGetGuildManagement(
        request: FastifyRequest<{ Params: GuildParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId } = request.params;
            const service = this.getService();

            const details = await service.getGuildManagementDetails( guildId );

            if ( !details ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

            return details;
        } catch( error ) {
            handleError( this.handleGetGuildManagement, error, reply, "Failed to fetch guild management details" );
        }
    }

    public async handleCreateScalingSetup(
        request: FastifyRequest<{ Params: GuildParams; Body: CreateScalingSetupBody }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId } = request.params;
            const { prefix, maxMembers } = request.body;
            const service = this.getService();

            const userOwnerId = request.session.userId;

            if ( !userOwnerId ) {
                return reply.status( 401 ).send( { error: "User not authenticated" } );
            }

            const success = await service.createScalingSetup( guildId, userOwnerId, { prefix, maxMembers } );

            if ( !success ) {
                return reply.status( 500 ).send( { error: "Failed to create scaling setup" } );
            }

            return reply.status( 201 ).send( { success: true, message: "Scaling setup creation initiated" } );
        } catch( error ) {
            handleError( this.handleCreateScalingSetup, error, reply, "Failed to create scaling setup" );
        }
    }

    public async handleGetScalingMasterDetails(
        request: FastifyRequest<{ Params: ScalingMasterParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const service = this.getService();

            const details = await service.getScalingMasterDetails( guildId, masterChannelId );

            if ( !details ) {
                return reply.status( 404 ).send( { error: "Scaling master channel not found" } );
            }

            return details;
        } catch( error ) {
            handleError( this.handleGetScalingMasterDetails, error, reply, "Failed to fetch scaling master details" );
        }
    }

    public async handleUpdateScalingSettings(
        request: FastifyRequest<{ Params: ScalingMasterParams; Body: UpdateScalingSettingsBody }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const settings = request.body as UpdateScalingSettingsInput;
            const service = this.getService();

            const success = await service.updateScalingSettings( guildId, masterChannelId, settings );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Scaling master channel not found" } );
            }

            return { success: true };
        } catch( error ) {
            handleError( this.handleUpdateScalingSettings, error, reply, "Failed to update scaling settings" );
        }
    }

    public async handleTriggerReindex(
        request: FastifyRequest<{ Params: ScalingMasterParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const service = this.getService();

            const success = await service.triggerReindex( guildId, masterChannelId );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Scaling master channel not found" } );
            }

            return { success: true, message: "Reindex triggered" };
        } catch( error ) {
            handleError( this.handleTriggerReindex, error, reply, "Failed to trigger reindex" );
        }
    }

    public async handleTriggerCleanup(
        request: FastifyRequest<{ Params: ScalingMasterParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const service = this.getService();

            const success = await service.triggerCleanup( guildId, masterChannelId );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Scaling master channel not found" } );
            }

            return { success: true, message: "Cleanup triggered" };
        } catch( error ) {
            handleError( this.handleTriggerCleanup, error, reply, "Failed to trigger cleanup" );
        }
    }

    public async handleDeleteScalingSetup(
        request: FastifyRequest<{ Params: ScalingMasterParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const service = this.getService();

            const success = await service.deleteScalingSetup( guildId, masterChannelId );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Scaling master channel not found" } );
            }

            return { success: true };
        } catch( error ) {
            handleError( this.handleDeleteScalingSetup, error, reply, "Failed to delete scaling setup" );
        }
    }

    public async handleGetDynamicMasterDetails(
        request: FastifyRequest<{ Params: DynamicMasterParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const service = this.getService();

            const details = await service.getDynamicMasterDetails( guildId, masterChannelId );

            if ( !details ) {
                return reply.status( 404 ).send( { error: "Dynamic master channel not found" } );
            }

            return details;
        } catch( error ) {
            handleError( this.handleGetDynamicMasterDetails, error, reply, "Failed to fetch dynamic master details" );
        }
    }

    public async handleUpdateDynamicSettings(
        request: FastifyRequest<{ Params: DynamicMasterParams; Body: UpdateDynamicSettingsBody }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const settings = request.body as UpdateDynamicSettingsInput;
            const service = this.getService();

            const success = await service.updateDynamicSettings( guildId, masterChannelId, settings );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Dynamic master channel not found" } );
            }

            return { success: true };
        } catch( error ) {
            handleError( this.handleUpdateDynamicSettings, error, reply, "Failed to update dynamic settings" );
        }
    }

    public async handleDeleteDynamicSetup(
        request: FastifyRequest<{ Params: DynamicMasterParams }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId, masterChannelId } = request.params;
            const service = this.getService();

            const success = await service.deleteDynamicSetup( guildId, masterChannelId );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Dynamic master channel not found" } );
            }

            return { success: true };
        } catch( error ) {
            handleError( this.handleDeleteDynamicSetup, error, reply, "Failed to delete dynamic setup" );
        }
    }

    public async handleCreateDynamicSetup(
        request: FastifyRequest<{ Params: GuildParams; Body: CreateDynamicSetupBody }>,
        reply: FastifyReply
    ) {
        try {
            const { guildId } = request.params;
            const { version, nameTemplate, autoSave, mentionable } = request.body;
            const service = this.getService();

            const userOwnerId = request.session.userId;

            if ( !userOwnerId ) {
                return reply.status( 401 ).send( { error: "User not authenticated" } );
            }

            const success = await service.createDynamicSetup( guildId, userOwnerId, { version, nameTemplate, autoSave, mentionable } );

            if ( !success ) {
                return reply.status( 500 ).send( { error: "Failed to create dynamic setup" } );
            }

            return reply.status( 201 ).send( { success: true, message: "Dynamic setup creation initiated" } );
        } catch( error ) {
            handleError( this.handleCreateDynamicSetup, error, reply, "Failed to create dynamic setup" );
        }
    }

    protected registerRoutes( fastify: FastifyInstance ): void {
        // Add guild access check to all routes
        fastify.addHook( "preHandler", requireGuildAccess );

        fastify.get<{ Params: GuildParams }>(
            "/management/guild/:guildId",
            this.handleGetGuildManagement.bind( this )
        );

        fastify.post<{ Params: GuildParams; Body: CreateScalingSetupBody }>(
            "/management/guild/:guildId/scaling",
            this.handleCreateScalingSetup.bind( this )
        );

        fastify.get<{ Params: ScalingMasterParams }>(
            "/management/guild/:guildId/scaling/:masterChannelId",
            this.handleGetScalingMasterDetails.bind( this )
        );

        fastify.put<{ Params: ScalingMasterParams; Body: UpdateScalingSettingsBody }>(
            "/management/guild/:guildId/scaling/:masterChannelId",
            this.handleUpdateScalingSettings.bind( this )
        );

        fastify.post<{ Params: ScalingMasterParams }>(
            "/management/guild/:guildId/scaling/:masterChannelId/reindex",
            this.handleTriggerReindex.bind( this )
        );

        fastify.post<{ Params: ScalingMasterParams }>(
            "/management/guild/:guildId/scaling/:masterChannelId/cleanup",
            this.handleTriggerCleanup.bind( this )
        );

        fastify.delete<{ Params: ScalingMasterParams }>(
            "/management/guild/:guildId/scaling/:masterChannelId",
            this.handleDeleteScalingSetup.bind( this )
        );

        // Dynamic channel routes
        fastify.post<{ Params: GuildParams; Body: CreateDynamicSetupBody }>(
            "/management/guild/:guildId/dynamic",
            this.handleCreateDynamicSetup.bind( this )
        );

        fastify.get<{ Params: DynamicMasterParams }>(
            "/management/guild/:guildId/dynamic/:masterChannelId",
            this.handleGetDynamicMasterDetails.bind( this )
        );

        fastify.put<{ Params: DynamicMasterParams; Body: UpdateDynamicSettingsBody }>(
            "/management/guild/:guildId/dynamic/:masterChannelId",
            this.handleUpdateDynamicSettings.bind( this )
        );

        fastify.delete<{ Params: DynamicMasterParams }>(
            "/management/guild/:guildId/dynamic/:masterChannelId",
            this.handleDeleteDynamicSetup.bind( this )
        );
    }
}

const managementRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    const managementRoute = ServiceLocator.$.get<ManagementRoute>( ManagementRoute.getName() );
    managementRoute.register( fastify );
};

export default managementRoutePlugin;
