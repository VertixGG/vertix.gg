#!/bin/bash

# Generate a 256-bit encryption key
encryptionKey=$(openssl rand -hex 32)

# Write the encryption key to a TypeScript file
echo "export const encryptionKey = Buffer.from(\"$encryptionKey\", \"hex\");" > key.ts

echo "Encryption key written to key.ts"
