import { getModulesData } from "@vertix.gg/api/src/server/services/module-service";
import { ERROR_MESSAGES, API_ROUTES } from "@vertix.gg/api/src/server/constants";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { ModulesResponse } from "@vertix.gg/api/src/server/types";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

async function handleGetModules( _request: FastifyRequest, reply: FastifyReply ) {
    try {
        return await getModulesData();
    } catch( error ) {
        handleError( handleGetModules, error, reply, ERROR_MESSAGES.FAILED_TO_FETCH_MODULES );
    }
}

const modulesRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Reply: ModulesResponse }>( API_ROUTES.MODULES, handleGetModules );
};

export default modulesRoutePlugin;
