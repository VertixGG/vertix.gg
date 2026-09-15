import { ComponentType } from "discord.js";

import { componentsBelongTo } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { Message } from "discord.js";

const ADAPTER = "VertixBot/UI-V3/ClaimStartAdapter",
    OTHER_ADAPTER = "VertixBot/UI-V3/DynamicChannelAdapter";

const SEPARATOR = "_";

/**
 * Stands in for the hash table: what an adapter sends is recorded here as it is generated, and
 * decoding is a lookup that answers with the hash itself when it recognises nothing - which is what
 * the real one does for a component it never wrote.
 */
function hashing() {
    const table = new Map<string, string>();

    let counter = 0;

    return {
        generate: ( id: string ) => {
            const hash = `ff9hash${ ++counter }`;

            table.set( hash, id );

            return hash;
        },
        decode: ( hash: string ) => table.get( hash ) ?? hash
    };
}

function messageWith( ... customIds: string[] ): Message[ "components" ] {
    return [
        {
            type: ComponentType.ActionRow,
            components: customIds.map( ( customId ) => ( { type: ComponentType.Button, customId } ) )
        }
    ] as unknown as Message[ "components" ];
}

/**
 * An adapter that did not send a message cannot be told it exists, so after a restart it has to
 * recognise its own work in the channel. The only mark on it is the custom id of the controls it
 * drew - and those reach discord hashed, so the name is not on them to read.
 */
describe( "VertixGUI/UIAdapterBase/componentsBelongTo", () => {
    it( "should recognise a message carrying its own control", () => {
        const { generate, decode } = hashing();

        const rows = messageWith( generate( ADAPTER + SEPARATOR + "ClaimStartButton" ) );

        expect( componentsBelongTo( rows, ADAPTER, decode ) ).toBe( true );
    } );

    it( "should not recognise another adapter's control", () => {
        const { generate, decode } = hashing();

        const rows = messageWith( generate( OTHER_ADAPTER + SEPARATOR + "RenameButton" ) );

        expect( componentsBelongTo( rows, ADAPTER, decode ) ).toBe( false );
    } );

    // The case the plain comparison gets wrong: hashed, the name is not in the custom id at all, so
    // reading the id as written matches nothing and the adapter finds none of its own messages.
    it( "should not be fooled by the hash itself", () => {
        const { generate, decode } = hashing();

        const hash = generate( ADAPTER + SEPARATOR + "ClaimStartButton" );

        expect( hash.startsWith( ADAPTER ) ).toBe( false );
        expect( componentsBelongTo( messageWith( hash ), ADAPTER, decode ) ).toBe( true );
    } );

    it( "should find its own control beside somebody else's", () => {
        const { generate, decode } = hashing();

        const rows = messageWith(
            generate( OTHER_ADAPTER + SEPARATOR + "RenameButton" ),
            generate( ADAPTER + SEPARATOR + "ClaimStartButton" )
        );

        expect( componentsBelongTo( rows, ADAPTER, decode ) ).toBe( true );
    } );

    it( "should pass over a control it cannot decode", () => {
        const { decode } = hashing();

        expect( componentsBelongTo( messageWith( "some-other-bots-button" ), ADAPTER, decode ) ).toBe( false );
    } );

    it( "should answer no for a message drawing nothing", () => {
        const { decode } = hashing();

        expect( componentsBelongTo( [], ADAPTER, decode ) ).toBe( false );
    } );
} );
