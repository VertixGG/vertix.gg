import { API_ROUTES } from "@vertix.gg/api/src/server/constants";

import {
    handleInstallCallback,
    readInstallDependencies
} from "@vertix.gg/api/src/server/services/install-attribution-service";

import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import type { IInstallCallbackQuery } from "@vertix.gg/api/src/server/services/install-attribution-service";

/**
 * Where discord sends somebody back after they add the bot through a link that asked it to.
 *
 * Outside `requireAuth`, like the paddle webhook: the person adding the bot has no dashboard session,
 * and what makes a request here count is the code discord issued, not who is holding it.
 */
const installRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Querystring: IInstallCallbackQuery }>( API_ROUTES.INSTALL_CALLBACK, async( request, reply ) => {
        let redirectTo = `${ readInstallDependencies().websiteUrl }/welcome`;

        try {
            const result = await handleInstallCallback( request.query, readInstallDependencies() );

            redirectTo = result.redirectTo;

            if ( result.recorded ) {
                request.log.info( `Install recorded through '${ request.query.state }'` );
            } else {
                request.log.info( `Install not recorded: ${ result.reason }` );
            }
        } catch( error ) {
            request.log.error( error, "Install callback failed to record" );
        }

        return reply.redirect( redirectTo );
    } );
};

export default installRoutePlugin;
