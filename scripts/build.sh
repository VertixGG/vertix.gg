# cd to project root
cd "$(dirname "$0")/.."

bash ./scripts/local-prisma-ensure-version.sh

# Create dist folder
mkdir -p dist

# Create dist/prisma folder
mkdir -p dist/prisma

# copy schema.prisma to dist/prisma folder
cp ./prisma/schema.prisma dist/prisma/schema.prisma

# Check if the argument for updating the package version is provided
if [[ "$1" == "--update-package-version" ]]; then
  # Run `update-package-version.sh` to update the package version
  ./scripts/update-package-version.sh
fi

# copy `assets` folder to `dist`
cp -r ./assets ./dist/assets

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
rm -f dist/vertix-bot

# Create executable
pkg . -C GZip

# Clean up
rm dist/index.js
rm dist/index.min.js
