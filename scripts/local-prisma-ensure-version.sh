# cd to project root
cd "$(dirname "$0")/.."

# Set the path to package.json
package_json_path="node_modules/.prisma/client/package.json"

# Check if package.json exists
if [ ! -f "$package_json_path" ]; then
  echo "package.json does not exist at $package_json_path"
  exit 1
fi

# Check if version key exists in package.json
if grep -q "\"version\":" "$package_json_path"; then
  echo "version key already exists in package.json"
else
  cp "tools/prisma-client-package.json" "$package_json_path"
  echo "copied tools/prisma-client-package.json to $package_json_path"
fi
