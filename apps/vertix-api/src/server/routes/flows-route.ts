import { getFlowData } from "@vertix.gg/api/src/server/services/flow-service";
import { ERROR_MESSAGES, API_ROUTES } from "@vertix.gg/api/src/server/constants";
import { handleError, sendBadRequest, sendNotFound } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FlowQuerystring } from "@vertix.gg/api/src/server/types";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

async function handleGetFlow( request: FastifyRequest<{ Querystring: FlowQuerystring }>, reply: FastifyReply ) {
    const { moduleName, flowName } = request.query;

    if ( !moduleName ) {
        sendBadRequest( reply, ERROR_MESSAGES.MISSING_MODULE_NAME );
        return;
    }

    try {
        const response = await getFlowData( moduleName, flowName );
        return response;
    } catch( error ) {
        if ( error instanceof Error && error.message.includes( "not found" ) ) {
            sendNotFound( reply, error.message );
            return;
        }

        handleError( handleGetFlow, error, reply, ERROR_MESSAGES.FAILED_TO_FETCH_FLOW );
    }
}

const flowsRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Querystring: FlowQuerystring }>( API_ROUTES.FLOWS, handleGetFlow );
};

export default flowsRoutePlugin;
