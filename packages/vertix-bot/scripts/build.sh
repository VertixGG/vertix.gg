# cd to project root
cd "$(dirname "$0")/.."

# Create dist folder
mkdir -p dist

# Check if the argument for updating the package version is provided
if [[ "$1" == "--update-package-version" ]]; then
  # Run `update-package-version.sh` to update the package version
  ./scripts/update-package-version.sh
fi

# Copy `assets` folder to `dist`
cp -r ./assets ./dist/

# Copy package.json to dist folder
cp ./package.json dist/package.json

# Take all files in `./tools/scripts-that-comes-with-build` and copy them to `./dist`
cp ./tools/scripts-that-comes-with-build/* ./dist/

# Copy `package.json to `./dist`
cp -f ./package.json ./dist/package.json

# Apply chmod +x to them.
chmod +x ./dist/*.sh

## Run the build script
bun run @z-cli @build --workspace bot --haltOnDiagnosticError
