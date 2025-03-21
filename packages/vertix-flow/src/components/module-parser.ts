/**
 * Helper module for parsing UI module files to extract adapter information
 */

interface Adapter {
  name: string;
  path: string;
  fullPath: string;
}

interface ParsedModule {
  moduleName: string;
  modulePath: string;
  adapters: Adapter[];
}

/**
 * Parse a UI module file content to extract adapter information
 *
 * @param filePath The path of the UI module file
 * @param content The content of the file
 * @returns Object containing module name and adapter information
 */
export const parseUIModule = ( filePath: string, content: string ): ParsedModule => {
  // Default result structure
  const result: ParsedModule = {
    moduleName: "Unknown",
    modulePath: filePath,
    adapters: []
  };

  try {
    // Extract module name
    const moduleNameMatch = content.match( /public static getName\(\) {[\s\S]*?return ['"](.*?)['"];/ );
    if ( moduleNameMatch && moduleNameMatch[ 1 ] ) {
      result.moduleName = moduleNameMatch[ 1 ];
    }

    // Extract imports for adapter paths
    const importLines = content.split( "\n" ).filter( line =>
      line.trim().startsWith( "import" ) && line.includes( "Adapter" )
    );

    // Find adapters in getAdapters method
    const adaptersMatch = content.match( /public static getAdapters\(\) {[\s\S]*?return \[([\s\S]*?)\];/ );

    if ( adaptersMatch && adaptersMatch[ 1 ] ) {
      // Get the array content
      const adaptersList = adaptersMatch[ 1 ].trim();

      // Split by commas and clean up
      const adapterNames = adaptersList
        .split( "," )
        .map( name => name.trim() )
        .filter( name => name.length > 0 );

      // Create adapter objects
      adapterNames.forEach( adapterName => {
        // Find the corresponding import
        const importLine = importLines.find( line => line.includes( adapterName ) );

        if ( importLine ) {
          // Extract path from import
          const pathMatch = importLine.match( /from ['"](.*?)['"]/ );
          const path = pathMatch ? pathMatch[ 1 ] : "unknown-path";

          result.adapters.push( {
            name: adapterName,
            path,
            fullPath: `${ path }/${ adapterName }`
          } );
        } else {
          // If no import found, still add with unknown path
          result.adapters.push( {
            name: adapterName,
            path: "unknown-path",
            fullPath: `unknown-path/${ adapterName }`
          } );
        }
      } );
    }

    return result;
  } catch ( error ) {
    console.error( "Error parsing UI module:", error );
    return result;
  }
};
