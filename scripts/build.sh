# cd to project root
cd "$(dirname "$0")/.."

# Create dist folder
mkdir -p dist

# Create dist/prisma folder
mkdir -p dist/prisma

# copy schema.prisma to dist/prisma folder
cp ./prisma/schema.prisma dist/prisma/schema.prisma

# Copy package.json to dist folder
cp ./package.json dist/package.json

# Bundle
tsup-node src/index.ts

# Minify
terser dist/index.js --comments false -o dist/index.min.js

sleep 1

# Remove old executable
rm -f dist/dynamico-bot

# Create executable
pkg .

# Clean up
rm dist/index.js
rm dist/index.min.js
