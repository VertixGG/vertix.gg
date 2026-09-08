import { API_ROUTES, HTTP_STATUS } from "@vertix.gg/api/src/server/constants";
import { getEmojiManifest } from "@vertix.gg/api/src/server/services/button-emoji-source";

import type { FastifyInstance, FastifyPluginAsync } from "fastify";

/**
 * The emoji artwork manifest the browser reads instead of shipping the svgs.
 *
 * A custom emoji id is only resolvable by the application that owns the emoji, which needs the bot
 * token - so the site and dashboard cannot reach Discord themselves. This endpoint does it for them
 * and returns `name -> data uri`, the single source both of them draw from.
 */
const buttonEmojisRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get( API_ROUTES.BUTTON_EMOJIS, async( _request, reply ) => {
        let manifest: Record<string, string>;

        try {
            manifest = await getEmojiManifest();
        } catch( error ) {
            fastify.log.error( error );

            return await reply.status( HTTP_STATUS.INTERNAL_SERVER_ERROR )
                .send( { error: "The emoji list could not be read" } );
        }

        return await reply
            .type( "application/json" )
            .header( "Cache-Control", "public, max-age=3600" )
            .send( manifest );
    } );
};

export default buttonEmojisRoutePlugin;
