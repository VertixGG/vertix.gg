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
  # Add version key with value 0.0.0 to package.json
  sed -i '1s/^/{\n  "version": "0.0.0",\n/' "$package_json_path"
  echo "Added version key with value 0.0.0 to package.json"
fi
