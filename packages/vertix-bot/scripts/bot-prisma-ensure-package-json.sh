# cd to project root
cd "$(dirname "$0")/.."

# Set the path to package.json
package_json_path="../vertix-base/src/prisma-bot-client/package.json"

cp -f "tools/prisma-bot-package.json" "$package_json_path"
