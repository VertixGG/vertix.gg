#!/usr/bin/env node

const targetTimezoneOffset = 3; // Number of hours to add
const logType = process.argv[ 2 ]; // Read logType from command-line arguments

if ( ! logType ) {
	console.log( "Usage: tail -f filename.log | log-extractor.js <logType>" );
}

function extractLog( log ) {
	const originalDateTime = log.match( /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/ )?.[ 0 ];

	if ( ! originalDateTime ) {
		return null;
	}

	const originalDate = originalDateTime.substring( 1, 11 );
	const originalTime = originalDateTime.substring( 12, 20 );
	const modifiedTime = new Date( `${originalDate} ${originalTime}` );

	modifiedTime.setHours( modifiedTime.getHours() + targetTimezoneOffset );

	const modifiedDateTime = `[${originalDate} ${modifiedTime.toTimeString().substring( 0, 8 )}]`;
	const modifiedLog = log.replace( /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}]/, modifiedDateTime );

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
		console.log( `${parsedLog.dateTime}: ${parsedLog.message}` );
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
