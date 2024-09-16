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

bun run vertix:base:jest - --ci --detectOpenHandles --runInBand
bun run vertix:bot:jest - --ci --detectOpenHandles --runInBand
bun run vertix:gui:jest - --ci --detectOpenHandles --runInBand

# TODO: ci can use bun runner for all packages
