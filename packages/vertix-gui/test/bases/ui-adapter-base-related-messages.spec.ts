import { BaseGuildVoiceChannel, Collection } from "discord.js";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { Message } from "discord.js";

const OWN_MESSAGE_ID = "830000000000000001",
    FOREIGN_MESSAGE_ID = "830000000000000002";

type Sweeper = { deleteRelatedComponentMessagesInternal( channel: unknown ): Promise<void> };

/**
 * A channel as much of one as the sweep looks at: what `instanceof` it answers to, the messages it
 * holds, and what happens when it is asked to take some of them down. Built off the prototype so
 * the type check passes without standing up a client to make a real one.
 */
function aChannel( options: {
    messages: Collection<string, Message>;
    bulkDelete?: ( messages: unknown, filterOld?: boolean ) => Promise<unknown>;
} ) {
    const calls: { filterOld?: boolean; ids: string[] }[] = [];

    const channel = Object.create( BaseGuildVoiceChannel.prototype );

    channel.messages = { fetch: () => Promise.resolve( options.messages ) };

    channel.bulkDelete =
        options.bulkDelete ??
        ( ( messages: Collection<string, Message>, filterOld?: boolean ) => {
            calls.push( { filterOld, ids: [ ... messages.keys() ] } );

            return Promise.resolve( messages );
        } );

    return { channel, calls };
}

/**
 * Only the adapter's own name, its logger, and the answer to "is this mine" - the sweep reads
 * nothing else off itself, so it is called against the prototype rather than standing an adapter up.
 */
function aSweeper( owns: ( message: Message ) => boolean ) {
    const errors: unknown[] = [];

    const state = {
        $$: { staticLogger: { error: ( ...args: unknown[] ) => void errors.push( args ) } },
        ownsComponentsOf: owns,
        deleteRelatedComponentMessagesInternal: ( UIAdapterBase.prototype as unknown as Sweeper )
            .deleteRelatedComponentMessagesInternal
    };

    return {
        errors,
        sweep: ( channel: unknown ) => ( state as unknown as Sweeper ).deleteRelatedComponentMessagesInternal( channel )
    };
}

const aMessage = ( id: string ) => ( { id } as Message );

/**
 * Takes down what the adapter left standing in a channel. It looked for its own name at the front
 * of a component's custom id as written, and the interface modules hash theirs - so it walked
 * channels and deleted nothing for as long as the hashing has been on.
 */
describe( "VertixGUI/UIAdapterBase/deleteRelatedComponentMessagesInternal", () => {
    it( "should take down the messages it owns and leave the rest", async() => {
        const messages = new Collection<string, Message>( [
            [ OWN_MESSAGE_ID, aMessage( OWN_MESSAGE_ID ) ],
            [ FOREIGN_MESSAGE_ID, aMessage( FOREIGN_MESSAGE_ID ) ]
        ] );

        const { channel, calls } = aChannel( { messages } ),
            { sweep } = aSweeper( ( message ) => OWN_MESSAGE_ID === message.id );

        await sweep( channel );

        expect( calls ).toHaveLength( 1 );
        expect( calls[ 0 ].ids ).toEqual( [ OWN_MESSAGE_ID ] );
    } );

    it( "should pass over messages too old to go this way rather than let them throw", async() => {
        const messages = new Collection<string, Message>( [ [ OWN_MESSAGE_ID, aMessage( OWN_MESSAGE_ID ) ] ] );

        const { channel, calls } = aChannel( { messages } ),
            { sweep } = aSweeper( () => true );

        await sweep( channel );

        // Discord refuses to bulk delete anything over a fortnight old. Asking it to skip those is
        // what keeps one old message from ending a sweep that walks every channel there is.
        expect( calls[ 0 ].filterOld ).toBe( true );
    } );

    it( "should not ask at all when it owns nothing there", async() => {
        const messages = new Collection<string, Message>( [ [ FOREIGN_MESSAGE_ID, aMessage( FOREIGN_MESSAGE_ID ) ] ] );

        const { channel, calls } = aChannel( { messages } ),
            { sweep } = aSweeper( () => false );

        await sweep( channel );

        expect( calls ).toHaveLength( 0 );
    } );

    /**
     * The hazard the matcher being fixed introduces. This runs down every channel there is on
     * startup, and a throw here ends that walk where it stands - every channel after it is never
     * looked at. It cost nothing while the match found nothing.
     */
    it( "should survive a refused delete rather than end the sweep", async() => {
        const messages = new Collection<string, Message>( [ [ OWN_MESSAGE_ID, aMessage( OWN_MESSAGE_ID ) ] ] );

        const { channel } = aChannel( {
            messages,
            bulkDelete: () => Promise.reject( new Error( "Missing Permissions" ) )
        } );

        const { sweep, errors } = aSweeper( () => true );

        await expect( sweep( channel ) ).resolves.toBeUndefined();

        expect( errors ).toHaveLength( 1 );
    } );

    it( "should survive a channel it cannot read rather than end the sweep", async() => {
        const channel = Object.create( BaseGuildVoiceChannel.prototype );

        channel.messages = { fetch: () => Promise.reject( new Error( "Missing Access" ) ) };

        const { sweep, errors } = aSweeper( () => true );

        await expect( sweep( channel ) ).resolves.toBeUndefined();

        expect( errors ).toHaveLength( 1 );
    } );

    it( "should leave alone a channel that holds no messages at all", async() => {
        const { channel, calls } = aChannel( { messages: new Collection<string, Message>() } ),
            { sweep } = aSweeper( () => true );

        await sweep( channel );

        expect( calls ).toHaveLength( 0 );
    } );
} );
