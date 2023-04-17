# cd previous directory
cd ..

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

# Clean up
rm dist/index.js
