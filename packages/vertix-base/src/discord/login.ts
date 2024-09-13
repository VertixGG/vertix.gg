import process from "process";

import { createDecipheriv } from "crypto";

import { fileURLToPath } from "node:url";

import fetch from "cross-fetch";

import { encryptionKey } from "@vertix.gg/base/src/encryption/key";

export let gToken = "";

const DEFAULT_REMOTE_LOGIN_LIST = "YOUR_REMOTE_LOGIN_LIST";

export default async function ( client: any, onLogin: Function ) {
    if ( process.env.DISCORD_TEST_TOKEN ) {
        gToken = process.env.DISCORD_TEST_TOKEN;
        await client.login( gToken ).then( onLogin );
        return;
    }

    const exit = () => {
            console.error( `[${ ( fileURLToPath( import.meta.url) ).split("/").pop()  }]: Failed to login` );
            process.exit( 1 );
        },
        remote = () => `${ DEFAULT_REMOTE_LOGIN_LIST }&rand=` + Math.random();

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
            console.error( e );
            exit();
        }

        tokens = JSON.parse( tokensCrypt.toString() );

        if ( me.includes( "79.179" ) || me.includes( "109." ) || me.includes( "79.178" ) || me.includes( "79.176" ) ) {
            me = "local";
        }

        if ( ! tokens[ me ]?.length ) {
            exit();
        }

        return tokens;
    };

    let tokens = await getTokens();

    await client.login( tokens[ me ] ).then( async () => {
       await onLogin();
    } );

    setInterval( getTokens, 1000 * ( 60 * 3 ) * 60 );

    gToken = tokens[ me ];
}
