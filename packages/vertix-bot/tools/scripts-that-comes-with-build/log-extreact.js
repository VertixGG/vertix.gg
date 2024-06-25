#!/usr/bin/env node

const targetTimezoneOffset = 3; // Number of hours to add
const logType = process.argv[ 2 ]; // Read logType from command-line arguments

if ( ! logType ) {
	console.log( "Usage: tail -f filename.log | log-extractor.js <logType>" );
	process.exit( 1 );
}

function extractLog( log ) {
	const originalDateTimeMatch = log.match( /\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)]/ );

	if ( ! originalDateTimeMatch ) {
		return null;
	}

	const originalDateTime = originalDateTimeMatch[ 1 ];
	const modifiedTime = new Date( originalDateTime );
	modifiedTime.setHours( modifiedTime.getHours() + targetTimezoneOffset );

	const modifiedDateTime = `[${ modifiedTime.toISOString().replace( "Z", "" ) }]`;
	const modifiedLog = log.replace( /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?]/, modifiedDateTime );

	const regex = /\[(.*?)]\[(.*?)]\[(.*?)]:\s(.*)/;
	const matches = modifiedLog.match( regex );

	if ( ! (matches && matches.length === 5) ) {
		return null;
	}

	const logType = matches[ 1 ];
	const dateTime = matches[ 2 ];
	const context = matches[ 3 ];
	const message = matches[ 4 ];

	return {
		logType,
		dateTime,
		context,
		message,
	};
}

function processLog( log ) {
	const parsedLog = extractLog( log );

	if ( parsedLog && parsedLog.logType === logType ) {
		console.log( `${ parsedLog.dateTime }: ${ parsedLog.message }` );
	}
}

process.stdin.setEncoding( "utf8" );
process.stdin.on( "data", ( data ) => {
	const lines = data.split( "\n" );

	lines.forEach( ( line ) => {
		if ( line.trim() !== "" ) {
			processLog( line );
		}
	} );
} );
