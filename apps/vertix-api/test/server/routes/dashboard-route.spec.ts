const OWNER_ID = "840000000000000001",
    SOMEBODY_ELSE = "840000000000000002";

/** A request as far as the check reads one - the session and the user on it. */
function requestFrom( userId: string | undefined ) {
    return { session: { userId } } as never;
}

/**
 * What keeps the growth figures - installs, by the link they came through - to the owner.
 */
describe( "VertixAPI/Routes/Dashboard/isOwnerRequest", () => {
    const configured = process.env.OWNERD_ID;

    afterEach( () => {
        if ( undefined === configured ) {
            delete process.env.OWNERD_ID;
        } else {
            process.env.OWNERD_ID = configured;
        }
    } );

    it( "should know the owner, and nobody else", async() => {
        process.env.OWNERD_ID = OWNER_ID;

        const { isOwnerRequest } = await import( "@vertix.gg/api/src/server/routes/dashboard-route" );

        expect( isOwnerRequest( requestFrom( OWNER_ID ) ) ).toBe( true );
        expect( isOwnerRequest( requestFrom( SOMEBODY_ELSE ) ) ).toBe( false );
    } );

    it( "should know nobody while no owner is configured - not even a session without a user", async() => {
        delete process.env.OWNERD_ID;

        const { isOwnerRequest } = await import( "@vertix.gg/api/src/server/routes/dashboard-route" );

        expect( isOwnerRequest( requestFrom( undefined ) ) ).toBe( false );
        expect( isOwnerRequest( requestFrom( OWNER_ID ) ) ).toBe( false );
    } );
} );
