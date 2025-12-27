import { Logger } from "@vertix.gg/base/src/modules/logger";

import { HTTP_STATUS } from "@vertix.gg/api/src/server/constants";

import type { ICaller } from "@vertix.gg/base/src/modules/logger";
import type { ErrorResponse } from "@vertix.gg/api/src/server/types";
import type { FastifyReply } from "fastify";

const logger = new Logger( "VertixAPI/Utils/ErrorHandler", { skipEventBusHook: true } );

export function handleError(
    handler: ICaller,
    error: unknown,
    reply: FastifyReply,
    errorMessage: string
): void {
    logger.error( handler, errorMessage, error );
    reply.status( HTTP_STATUS.INTERNAL_SERVER_ERROR ).send( {
        error: errorMessage,
        message: error instanceof Error ? error.message : "Unknown error"
    } as ErrorResponse );
}

export function sendBadRequest( reply: FastifyReply, message: string ): void {
    reply.status( HTTP_STATUS.BAD_REQUEST ).send( {
        error: "Missing parameters",
        message
    } as ErrorResponse );
}

export function sendNotFound( reply: FastifyReply, message: string ): void {
    reply.status( HTTP_STATUS.NOT_FOUND ).send( {
        error: "Not found",
        message
    } as ErrorResponse );
}
