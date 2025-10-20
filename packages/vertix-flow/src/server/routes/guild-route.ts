import { Type } from "@fastify/type-provider-typebox";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

const prisma = PrismaBotClient.getInstance().getClient();

// Define the structure of a Guild for the response schema
const GuildSchema = Type.Object( {
    guildId: Type.String(),
    name: Type.String(),
} );

/**
 * Guilds route handler
 */
export class GuildRoute extends InitializeBase {
    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/Routes/GuildRoute";
    }

    public constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.log( this.initialize, "Guild route initialized" );
    }

    /**
     * Handle guilds request
     */
    public handleGuilds = async( _request: FastifyRequest, reply: FastifyReply ) => {
        try {
            // Fetch only guilds marked as currently being in
            // Adjust the where clause or select fields as needed
            const guilds = await prisma.guild.findMany( {
                where: { isInGuild: true },
                select: {
                    guildId: true,
                    name: true,
                },
                orderBy: {
                    name: "asc", // Optional: sort alphabetically by name
                },
            } );
            this.logger.info( this.handleGuilds, `Found ${ guilds.length } guilds.` );
            return guilds;
        } catch ( error ) {
            this.logger.error( this.handleGuilds, "Error fetching guilds:", error );
            reply.status( 500 ).send( {
                error: "Failed to fetch guilds",
                message: error instanceof Error ? error.message : "Unknown error",
            } );
            // Return an empty array or rethrow, depending on desired error flow
            return [];
        }
    };

    /**
     * Register routes with Fastify instance
     */
    public async register( instance: FastifyInstance ): Promise<void> {
        // Schema for guilds response
        const guildsSchema = {
            response: {
                200: Type.Array( GuildSchema ),
                // Add error schemas if needed (e.g., 500)
                500: Type.Object( {
                    error: Type.String(),
                    message: Type.String(),
                } ),
            },
        };

        instance.get( "/guilds", { schema: guildsSchema }, this.handleGuilds );
    }
}

/**
 * Guilds route plugin for Fastify
 */
const guildRoutePlugin: FastifyPluginAsync = async( fastify ): Promise<void> => {
    const route = new GuildRoute();
    // Assuming InitializeBase handles its own async initialization if needed
    await route.register( fastify );
};

export default guildRoutePlugin;
