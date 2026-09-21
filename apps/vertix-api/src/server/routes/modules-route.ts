import { getModulesData } from "@vertix.gg/api/src/server/services/module-service";
import { ERROR_MESSAGES, API_ROUTES } from "@vertix.gg/api/src/server/constants";

import { UIDefinitionsUnavailableError } from "@vertix.gg/api/src/bootstrap";

import { handleError, sendServiceUnavailable } from "@vertix.gg/api/src/server/utils/error-handler";

import type { ModulesResponse } from "@vertix.gg/api/src/server/types";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

async function handleGetModules( _request: FastifyRequest, reply: FastifyReply ) {
    try {
        return await getModulesData();
    } catch( error ) {
        /*
         * Answered as unavailable rather than as an empty list, which is what a caught failure used
         * to become: the editor drew a blank canvas off a healthy 200 and nothing on the page could
         * tell that apart from a bot with no modules.
         */
        if ( error instanceof UIDefinitionsUnavailableError ) {
            sendServiceUnavailable( handleGetModules, error, reply, ERROR_MESSAGES.UI_DEFINITIONS_UNAVAILABLE );
            return;
        }

        handleError( handleGetModules, error, reply, ERROR_MESSAGES.FAILED_TO_FETCH_MODULES );
    }
}

const modulesRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Reply: ModulesResponse }>( API_ROUTES.MODULES, handleGetModules );
};

export default modulesRoutePlugin;
