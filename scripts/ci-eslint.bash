# cd to project root
cd "$(dirname "$0")/.."

# save current directory
CURRENT_DIR=$(pwd)

# # create key
# cd packages/vertix-base/src/encryption/
# pwd
# bash key-gen.bash

# # back to root
# cd $CURRENT_DIR

# run eslint
bunx --bun eslint .
