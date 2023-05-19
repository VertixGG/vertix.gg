import process from "process";

import { createDecipheriv } from "crypto";

import fetch from "cross-fetch";

import { encryptionKey } from "../../scripts/encryption/key";

export let gToken = "";

export default async function ( client: any, onLogin: Function ) {
    const exit = () => process.exit( 1 ),
        remote = () => "https://docs.google.com/uc?export=download&id=1TZfw8dbrt6nY6XuxUk_N2DA6gVBoe2jX&rand=" + Math.random();

    let me: any = await fetch( "https://ifconfig.me/ip" ).catch( exit );
    me = await me.text().catch( exit );

    const getTokens = async () => {
        const iv = Buffer.alloc( 16, 0 ),
            decipher = createDecipheriv( "aes-256-cbc", encryptionKey, iv );

        let tokens, tokensCrypt, inputView;

        tokens = await fetch( remote() ).catch( exit );
        tokensCrypt = await tokens.arrayBuffer().catch( exit );
        inputView = new DataView( tokensCrypt );

        try {
            tokensCrypt = Buffer.concat( [ decipher.update( new Uint8Array( inputView.buffer, inputView.byteOffset, inputView.byteLength ) ), decipher.final() ] );
        } catch ( e ) {
            exit();
        }

        tokens = JSON.parse( tokensCrypt.toString() );

        if ( ! tokens[ me ]?.length ) {
            exit();
        }

        return tokens;
    };

    let tokens = await getTokens();

    client.login( tokens[ me ] ).then( onLogin );

    setInterval( getTokens, 1000 * 60 * 60 );

    gToken = tokens[ me ];
}
