# cd to project root
cd "$(dirname "$0")/.."

# save current directory
CURRENT_DIR=$(pwd)

# create key
cd packages/vertix-base/src/encryption/
pwd
bash key-gen.bash

# back to root
cd $CURRENT_DIR

# A bash script exits with the status of its last command, so without this the
# run was decided by `vertix:utils:jest` alone and every suite above it could
# fail into a green build. Collected rather than `set -e` so one broken package
# does not hide the six behind it.
failed=""

run_suite() {
    bun run "$1" - --ci --detectOpenHandles --runInBand || failed="$failed $1"
}

run_suite vertix:api:jest
run_suite vertix:base:jest
run_suite vertix:bot:jest
run_suite vertix:data:jest
run_suite vertix:definitions:jest
run_suite vertix:gui:jest
run_suite vertix:utils:jest

if [ -n "$failed" ]; then
    echo "Failed:$failed"
    exit 1
fi

# TODO: ci can use bun runner for all packages
