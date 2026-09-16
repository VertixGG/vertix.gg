/**
 * What a prisma error is, told apart by its code.
 *
 * Matched on `code` rather than on the error class, so recognising one does not mean importing
 * prisma's runtime wherever the question is asked.
 */
function hasCode( error: unknown, ... codes: string[] ): boolean {
    if ( "object" !== typeof error || null === error || !( "code" in error ) ) {
        return false;
    }

    return codes.includes( String( ( error as { code?: unknown } ).code ) );
}

/**
 * Function isRecordNotFound() :: "An operation failed because it depends on one or more records
 * that were required but not found."
 *
 * Deleting or updating a row that was never written is this, and for the callers that forget things
 * it is an answer rather than a failure.
 */
export function isRecordNotFound( error: unknown ): boolean {
    return hasCode( error, "P2025" );
}

/**
 * Function isDatabaseUnavailable() :: The database could not be reached at all.
 *
 * `P1001` cannot reach the server, `P1017` the server closed the connection, and `P2010` is a raw
 * query failure - which is what a replica set with no primary answers, since the driver gets as far
 * as sending the query and no further.
 *
 * Worth telling apart from every other failure because nothing the caller did caused it and nothing
 * it can do will fix it: the useful thing to say is that the database is unreachable, once, rather
 * than to report whichever query happened to be in flight every time one is tried.
 */
export function isDatabaseUnavailable( error: unknown ): boolean {
    if ( hasCode( error, "P1001", "P1017" ) ) {
        return true;
    }

    // P2010 covers any raw query failure, so the code alone is not enough - a query that is simply
    // wrong reports the same one. The driver's own words are what separate the two.
    if ( !hasCode( error, "P2010" ) ) {
        return false;
    }

    const message = String( ( error as { message?: unknown } ).message ?? "" );

    return message.includes( "Server selection timeout" ) ||
        message.includes( "No available servers" ) ||
        message.includes( "ReplicaSetNoPrimary" );
}
