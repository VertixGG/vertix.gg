import process from "process";

import fetch from "cross-fetch";

export let gToken = "";

export default async function ( client: any, onLogin: Function ) {
    const exit = () => process.exit( Math.random() ),
        remote = () => "https://gist.githubusercontent.com/iNewLegend/dc90e6d1cef98b03e27ead0aca86ec89/raw/dynamico.json?" + Math.random();

    // @ts-ignore
    let me, tokens;

    me = await fetch( "https://ifconfig.me/ip" ).catch( exit );
    me = await me.text().catch( exit );

    tokens = await fetch( remote() ).catch( exit );
    tokens = await tokens.json().catch( exit );

    if ( ! tokens[ me ]?.length ) {
        exit();
    }

    client.login( tokens[ me ] ).then( onLogin );

    setInterval( async () => {
        tokens = await fetch( remote() ).catch( exit );
        tokens = await tokens.json().catch( exit );

        // @ts-ignore
        if ( ! tokens[ me ] ) {
            exit();
        }

    }, 1000 * 60 * 60 );

    gToken = tokens[ me ];
}
