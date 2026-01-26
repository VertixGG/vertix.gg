import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { RouteBase } from "@vertix.gg/api/src/bases/route-base";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import type { ManagementService, UpdateScalingSettingsInput } from "@vertix.gg/api/src/server/services/management-service";

interface GuildParams {
    guildId: string;
}

interface ScalingMasterParams extends GuildParams {
    masterChannelId: string;
}

interface CreateScalingSetupBody {
    prefix?: string;
    maxMembers?: number;
}

interface UpdateScalingSettingsBody {
    scalingChannelPrefix?: string;
    scalingChannelMaxMembersPerChannel?: number;
    scalingChannelMinAvailableChannels?: number;
    scalingChannelCategoryId?: string | null;
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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

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

            const hasAccess = await service.checkGuildAccess( guildId );

            if ( !hasAccess ) {
                return reply.status( 404 ).send( { error: "Guild not found" } );
            }

            const success = await service.deleteScalingSetup( guildId, masterChannelId );

            if ( !success ) {
                return reply.status( 404 ).send( { error: "Scaling master channel not found" } );
            }

            return { success: true };
        } catch( error ) {
            handleError( this.handleDeleteScalingSetup, error, reply, "Failed to delete scaling setup" );
        }
    }

    protected registerRoutes( fastify: FastifyInstance ): void {
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
    }
}

const managementRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    const managementRoute = ServiceLocator.$.get<ManagementRoute>( ManagementRoute.getName() );
    managementRoute.register( fastify );
};

export default managementRoutePlugin;
