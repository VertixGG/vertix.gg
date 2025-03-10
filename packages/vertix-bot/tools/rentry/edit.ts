import { RentryManager } from "@vertix.gg/bot/src/managers/rentry";

if ( process.argv.length < 5 ) {
    console.log( "Usage: ts-node editReply.ts <url> <editReply-code> <content>" );
    process.exit( 1 );
}

async function main () {
    const result = await RentryManager.$.edit(
        process.argv[ 2 ],
        process.argv[ 3 ],
        process.argv[ 4 ]
    );

    console.log( result );
}

main();
