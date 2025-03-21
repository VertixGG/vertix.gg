import { join } from "path";
import { statSync } from "fs";

// Create a server that serves static files from the public directory
// and handles the React application
const server = Bun.serve( {
  port: 3000,
  async fetch( req: Request ) {
    const url = new URL( req.url );
    const pathname = url.pathname;

    // Serve the index.html for the root path
    if ( pathname === "/" ) {
      return new Response( Bun.file( join( import.meta.dir, "../public/index.html" ) ) );
    }

    try {
      // Try to serve files from the project directory
      const filePath = join( import.meta.dir, "..", pathname );

      // Check if file exists
      try {
        statSync( filePath );
        return new Response( Bun.file( filePath ) );
      } catch {
        // If it's a .tsx file that doesn't exist directly, try to serve it as a module
        if ( pathname.endsWith( ".tsx" ) ) {
          // For TypeScript files, return them as modules
          return new Response( Bun.file( filePath ), {
            headers: {
              "Content-Type": "application/javascript",
            },
          } );
        }
      }
    } catch ( _ ) {
      // If any error occurs, serve the index.html (for SPA routing)
      return new Response( Bun.file( join( import.meta.dir, "../public/index.html" ) ) );
    }

    // Default: serve index.html for client-side routing
    return new Response( Bun.file( join( import.meta.dir, "../public/index.html" ) ) );
  },
} );

console.log( `🚀 Server running at http://localhost:${ server.port }` );
