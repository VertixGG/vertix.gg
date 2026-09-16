import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const unavailable = () => Object.assign(
    new Error( "raw query failed" ),
    {
        code: "P2010",
        message: "Raw query failed. Code: `unknown`. Message: `Kind: Server selection timeout: " +
            "No available servers. Topology: { Type: ReplicaSetNoPrimary, Set Name: rs0 }`"
    }
);

/**
 * Stands up only the reindex scheduler: the pass it runs, the flag it keeps, and the logger it
 * reports to. The interval it sets is cleared by the caller, so nothing is left running.
 */
async function makeService() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { ScalingChannelService } = await import( "@vertix.gg/bot/src/services/scaling-channel-service" );

    const errors: string[] = [],
        infos: string[] = [];

    let outcome: () => Promise<void> = async() => {};

    const service = Object.create( ScalingChannelService.prototype ) as InstanceType<typeof ScalingChannelService>;

    Object.assign( service, {
        isDatabaseUnavailable: false,
        reindexInterval: undefined,
        logger: {
            error: ( _caller: unknown, message: unknown ) => errors.push( String( message ) ),
            info: ( _caller: unknown, message: unknown ) => infos.push( String( message ) )
        },
        reindexScalingChannels: () => outcome()
    } );

    const internals = service as unknown as {
        scheduleScalingReindex: () => void;
        reindexInterval?: NodeJS.Timeout;
    };

    // One pass, then the interval is dropped so the test leaves nothing behind.
    const runPass = async( next: () => Promise<void> ) => {
        outcome = next;

        internals.reindexInterval = undefined;
        internals.scheduleScalingReindex();

        if ( internals.reindexInterval ) {
            clearInterval( internals.reindexInterval );
            internals.reindexInterval = undefined;
        }

        await new Promise( ( resolve ) => setImmediate( resolve ) );
    };

    return { runPass, errors, infos };
}

describe( "VertixBot/Services/ScalingChannel/reindex reporting", () => {

    /**
     * The pass runs every five minutes forever, so a condition that lasts reports itself until it
     * stops. A seven hour outage went out as seventy six copies of "Failed to reindex scaling
     * channels", each with the cause buried fifteen lines into a prisma dump.
     */
    it( "should report an unreachable database once, however many passes fail", async() => {
        const { runPass, errors } = await makeService();

        for ( let attempt = 0; attempt < 5; attempt++ ) {
            await runPass( async() => {
                throw unavailable();
            } );
        }

        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ] ).toContain( "Database is unreachable" );
    } );

    it( "should say when the database comes back", async() => {
        const { runPass, errors, infos } = await makeService();

        await runPass( async() => {
            throw unavailable();
        } );
        await runPass( async() => {} );

        expect( errors ).toHaveLength( 1 );
        expect( infos ).toEqual( [ "Database is reachable again" ] );
    } );

    it( "should report it again if it goes away a second time", async() => {
        const { runPass, errors } = await makeService();

        await runPass( async() => {
            throw unavailable();
        } );
        await runPass( async() => {} );
        await runPass( async() => {
            throw unavailable();
        } );

        expect( errors ).toHaveLength( 2 );
    } );

    // Quietening an outage must not quieten a fault in the pass itself.
    it( "should report an ordinary failure every time", async() => {
        const { runPass, errors } = await makeService();

        for ( let attempt = 0; attempt < 3; attempt++ ) {
            await runPass( async() => {
                throw new Error( "something the pass itself got wrong" );
            } );
        }

        expect( errors ).toHaveLength( 3 );
        expect( errors[ 0 ] ).toContain( "Failed to reindex scaling channels" );
    } );
} );
