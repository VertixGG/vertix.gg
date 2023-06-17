import { createDecipheriv } from "crypto";
import { readFile } from "fs/promises";

import { encryptionKey } from "./key";

const algorithm = "aes-256-cbc";
const iv = Buffer.alloc( 16, 0 ); // Initialization vector

export async function decryptData( inputFile: string ) {
    // Read the encrypted content from the input file
    const encryptedData = await readFile( inputFile );

    // Create a decipher object with the encryption key and IV
    const decipher = createDecipheriv( algorithm, encryptionKey, iv );

    // Decrypt the encrypted content
    const decryptedData = Buffer.concat( [ decipher.update( encryptedData ), decipher.final() ] );

    console.log( `Decrypted data: ${ decryptedData.toString() }` );
}

decryptData( process.argv[ 2 ] );
