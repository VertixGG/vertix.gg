# cd to project root
cd "$(dirname "$0")/.."

# save current directory
CURRENT_DIR=$(pwd)

workspace_patterns=$(jq -r '.workspaces[]' package.json)

packages=""

for workspace_pattern in $workspace_patterns; do
    workspace_dir=$(echo "$workspace_pattern" | sed 's/\*//')

    found_packages=$(find "$workspace_dir" -type f -name "tsconfig.json" -not -path "*/node_modules/*" 2>/dev/null)

    packages="$packages
$found_packages"
done

packages=$(echo "$packages" | sed '/^$/d')

echo "Current directory: $CURRENT_DIR"
echo "Workspace: $workspace_patterns"
echo "Packages: $packages"

# if no package found, exit with error
if [ -z "$packages" ]; then
    echo "No packages found"
    exit 1
fi

for package in $packages; do
    package_dir=$(dirname "$package")
    echo "Type checking $package_dir"

    cd "$package_dir"
    
    bun run --bun tsc --noEmit
    if [ $? -ne 0 ]; then
        echo "Type check failed for $package_dir"
        cd "$CURRENT_DIR"
        exit 1
    fi
    cd "$CURRENT_DIR"
done

# # back to root
cd "$CURRENT_DIR"

echo "Type check passed for all packages"