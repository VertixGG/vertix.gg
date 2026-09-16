import { DataVersioningModelFactory } from "@vertix.gg/data/src/factory/data-versioning-model-factory";

const KEYS = { key: "DynamicChannelClaim/State", version: "0.0.0.2" } as const;

/**
 * Prisma's error for "required but not found", as `delete()` throws it. Matched on `code`, so that
 * is what the test carries - the real object has a great deal more on it and none of it is read.
 */
function recordNotFound() {
    return Object.assign( new Error( "An operation failed because it depends on one or more records that were required but not found." ), { code: "P2025" } );
}

function createModel( onDelete: () => unknown ) {
    const calls: unknown[] = [];

    const model = {
        delete: async( args: unknown ) => {
            calls.push( args );
            return onDelete();
        }
    };

    const Versioning = DataVersioningModelFactory( model as never );

    return { instance: new Versioning( false, false ), calls };
}

describe( "VertixData/Factory/DataVersioningModel/delete", () => {

    /**
     * Forgetting something never written down is not a failure. Every caller of this is of the
     * "this no longer applies" kind, and a brand new dynamic channel legitimately runs one against
     * a row that was never created - which used to log a full prisma stack trace on every first
     * owner join.
     */
    it( "should answer null when the record was never there", async() => {
        const { instance, calls } = createModel( () => {
            throw recordNotFound();
        } );

        await expect( instance.delete( KEYS ) ).resolves.toBeNull();

        // Asked for, rather than skipped by looking first - two round trips to avoid an error that
        // is not one would be the worse trade.
        expect( calls ).toHaveLength( 1 );
    } );

    // Tolerating the absent row must not turn into tolerating everything; that is what the bare
    // `.catch( () => {} )` this replaced did.
    it( "should still throw anything that is not a missing record", async() => {
        const { instance } = createModel( () => {
            throw Object.assign( new Error( "connection lost" ), { code: "P1001" } );
        } );

        await expect( instance.delete( KEYS ) ).rejects.toThrow( "connection lost" );
    } );

    it( "should answer the deleted record when there was one", async() => {
        const record = { id: "row-id", key: KEYS.key };

        const { instance } = createModel( () => record );

        await expect( instance.delete( KEYS ) ).resolves.toEqual( record );
    } );
} );
