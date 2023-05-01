import { createCipheriv } from "crypto";
import { readFile, writeFile } from "fs/promises";

import { encryptionKey } from "./key";

const algorithm = "aes-256-cbc";
const iv = Buffer.alloc( 16, 0 ); // Initialization vector

export async function encryptData( inputFile: string, outputFile: string ) {
    // Read the input data from the file
    const inputBuffer = await readFile( inputFile );

    // Create a cipher object with the encryption key and IV
    const cipher = createCipheriv( algorithm, encryptionKey, iv );

    // Encrypt the input data and write it to the output file
    const encryptedData = Buffer.concat( [ cipher.update( inputBuffer ), cipher.final() ] );
    await writeFile( outputFile, encryptedData );

    console.log( `Data encrypted and written to ${ outputFile }` );
}

encryptData( process.argv[ 2 ], process.argv[ 3 ] );
