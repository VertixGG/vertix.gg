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

    # A tsconfig that points at other projects and names no files of its own checks nothing at all,
    # and passes for it - which is what the dashboard did for as long as it had one. Build mode
    # follows the references and checks what they cover.
    #
    # One that references and also includes is a project in its own right, and is checked as one:
    # the website is that, and build mode there would additionally report its vite config against a
    # scope that has never covered it.
    #
    # Matched by reading the file rather than parsing it: these are jsonc, comments and all, and
    # every json parser on the machine refuses them.
    if grep -q '"references"' tsconfig.json && ! grep -q '"include"' tsconfig.json; then
        bun run --bun tsc -b
    else
        bun run --bun tsc --noEmit
    fi

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