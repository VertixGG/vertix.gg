import type { FastifyReply, FastifyRequest } from "fastify";

export async function requireAuth( request: FastifyRequest, reply: FastifyReply ) {
    if ( !request.session.userId ) {
        return reply.status( 401 ).send( { error: "Authentication required" } );
    }
}
