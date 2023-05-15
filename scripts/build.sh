# cd to project root
cd "$(dirname "$0")/.."

bash ./scripts/local-prisma-ensure-version.sh

# Create dist folder
mkdir -p dist

# Create dist/prisma folder
mkdir -p dist/prisma

# copy schema.prisma to dist/prisma folder
cp ./prisma/schema.prisma dist/prisma/schema.prisma

# Run `update-package-version.sh` to build number
bash ./scripts/update-package-version.sh

# Copy package.json to dist folder
cp ./package.json dist/package.json

# Take all '.sh' files in `./tools/scripts-that-comes-with-build` and copy them to `./dist`
cp ./tools/scripts-that-comes-with-build/* ./dist/

# Copy `package.json to `./dist`
cp -f ./package.json ./dist/package.json

# Copy `yarn.lock to `./dist`
cp -f ./yarn.lock ./dist/yarn.lock

# Apply chmod +x to them.
chmod +x ./dist/*.sh

# Bundle
tsup-node src/index.ts

# Minify
terser dist/index.js --comments false -o dist/index.min.js

# Remove old executable
rm -f dist/dynamico-bot

# Create executable
pkg .

# Clean up
rm dist/index.js
rm dist/index.min.js
