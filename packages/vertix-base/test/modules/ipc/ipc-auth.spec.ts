import {
    isIPCAuthConfigured,
    signIPCEnvelope,
    verifyIPCEnvelope
} from "@vertix.gg/base/src/modules/ipc/ipc-auth";

const SECRET = "a-shared-secret-for-tests";

/**
 * A management message of the shape the api publishes, including a numeric-looking key - the case
 * where a naive `JSON.stringify` on each side disagrees about ordering.
 */
function createEnvelope( overrides: Record<string, unknown> = {} ) {
    return {
        id: "1730000000000-abc1234",
        timestamp: Date.now(),
        channel: "vertix:management",
        payload: {
            action: "delete_dynamic_setup",
            data: { guildId: "123456789", masterChannelId: "987654321", "2": "numeric-key" }
        },
        ...overrides
    };
}

describe( "VertixBase/Modules/IPC/Auth", () => {
    const originalSecret = process.env.IPC_SHARED_SECRET;

    beforeEach( () => {
        process.env.IPC_SHARED_SECRET = SECRET;
    } );

    afterEach( () => {
        if ( undefined === originalSecret ) {
            delete process.env.IPC_SHARED_SECRET;
        } else {
            process.env.IPC_SHARED_SECRET = originalSecret;
        }
    } );

    it( "it should accept an envelope it signed itself", () => {
        // Arrange.
        const envelope = createEnvelope();

        // Act.
        const signed = { ...envelope, signature: signIPCEnvelope( envelope ) };

        // Assert.
        expect( verifyIPCEnvelope( signed ) ).toEqual( { valid: true } );
    } );

    it( "it should accept an envelope that travelled through JSON", () => {
        // Arrange.
        const envelope = createEnvelope();
        const signed = { ...envelope, signature: signIPCEnvelope( envelope ) };

        // Act - what Redis actually delivers: a parse of a stringify.
        const delivered = JSON.parse( JSON.stringify( signed ) );

        // Assert.
        expect( verifyIPCEnvelope( delivered ).valid ).toBe( true );
    } );

    it( "it should not care what order the keys arrive in", () => {
        // Arrange.
        const envelope = createEnvelope();
        const signature = signIPCEnvelope( envelope );

        // Act.
        const reordered = {
            signature,
            payload: envelope.payload,
            channel: envelope.channel,
            timestamp: envelope.timestamp,
            id: envelope.id
        };

        // Assert.
        expect( verifyIPCEnvelope( reordered ).valid ).toBe( true );
    } );

    it( "it should refuse an unsigned envelope", () => {
        // Act.
        const result = verifyIPCEnvelope( createEnvelope() );

        // Assert.
        expect( result.valid ).toBe( false );
    } );

    it( "it should refuse an envelope whose payload was altered", () => {
        // Arrange.
        const envelope = createEnvelope();
        const signed = { ...envelope, signature: signIPCEnvelope( envelope ) };

        // Act - the action swapped for a more destructive one.
        signed.payload = { action: "delete_scaling_setup", data: { guildId: "123456789" } } as never;

        // Assert.
        expect( verifyIPCEnvelope( signed ).valid ).toBe( false );
    } );

    it( "it should refuse an envelope replayed onto another channel", () => {
        // Arrange.
        const envelope = createEnvelope();
        const signed = { ...envelope, signature: signIPCEnvelope( envelope ) };

        // Act.
        signed.channel = "vertix:management:request";

        // Assert.
        expect( verifyIPCEnvelope( signed ).valid ).toBe( false );
    } );

    it( "it should refuse an envelope older than the replay window", () => {
        // Arrange.
        const envelope = createEnvelope( { timestamp: Date.now() - 120000 } );

        // Act.
        const signed = { ...envelope, signature: signIPCEnvelope( envelope ) };

        // Assert - signed correctly, but too old to act on.
        expect( verifyIPCEnvelope( signed ).valid ).toBe( false );
    } );

    it( "it should refuse an envelope signed with a different secret", () => {
        // Arrange.
        const envelope = createEnvelope();
        process.env.IPC_SHARED_SECRET = "somebody-elses-secret";
        const signature = signIPCEnvelope( envelope );

        // Act.
        process.env.IPC_SHARED_SECRET = SECRET;

        // Assert.
        expect( verifyIPCEnvelope( { ...envelope, signature } ).valid ).toBe( false );
    } );

    it( "it should refuse a malformed signature rather than throwing", () => {
        // Arrange.
        const envelope = createEnvelope();

        // Act & Assert - a short one and a non-hex one both reach timingSafeEqual.
        expect( verifyIPCEnvelope( { ...envelope, signature: "ab" } ).valid ).toBe( false );
        expect( verifyIPCEnvelope( { ...envelope, signature: "zz".repeat( 32 ) } ).valid ).toBe( false );
    } );

    it( "it should refuse everything when no secret is configured", () => {
        // Arrange.
        const envelope = createEnvelope();
        const signed = { ...envelope, signature: signIPCEnvelope( envelope ) };

        // Act.
        delete process.env.IPC_SHARED_SECRET;

        // Assert.
        expect( isIPCAuthConfigured() ).toBe( false );
        expect( verifyIPCEnvelope( signed ).valid ).toBe( false );
        expect( () => signIPCEnvelope( envelope ) ).toThrow( /IPC_SHARED_SECRET/ );
    } );
} );
