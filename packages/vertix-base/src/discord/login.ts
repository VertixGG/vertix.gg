import process from "process";

export let gToken = "";

export default async function( client: any, onLogin: Function, token?: string ) {
    const loginToken = ( token || process.env.DISCORD_BOT_TOKEN || "").trim();

    if ( loginToken ) {
        // Only set the global token if it's the primary bot login (no explicit token provided)
        if ( ! token ) {
            gToken = loginToken;
        }

        await client.login( loginToken ).then( () => onLogin() );
        return;
    }

    console.log( "No token found" );
    process.exit( 0 );
}
