#!/usr/bin/env bash

set -e

# The repository root, so the script works from any working directory.
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( dirname "${scriptDir}" )"
envFile="${rootDir}/.env"

# Read a single variable out of .env without sourcing the whole file, values there may contain
# spaces, quotes and "#" characters that a blanket export would mangle.
readEnvVar() {
    local name="$1"
    local value

    [ -f "${envFile}" ] || return 0

    value="$( sed -n "s/^[[:space:]]*${name}[[:space:]]*=[[:space:]]*//p" "${envFile}" | head -1 )"

    # Strip a trailing carriage return and matching surrounding quotes.
    value="${value%$'\r'}"
    case "${value}" in
        \"*\" ) value="${value#\"}"; value="${value%\"}" ;;
        \'*\' ) value="${value#\'}"; value="${value%\'}" ;;
    esac

    printf '%s' "${value}"
}

if [ -z "${BOT_PRISMA_DATABASE_URL}" ]; then
    BOT_PRISMA_DATABASE_URL="$( readEnvVar BOT_PRISMA_DATABASE_URL )"
fi

mongoUri="${BOT_PRISMA_DATABASE_URL:?BOT_PRISMA_DATABASE_URL is required, set it in the environment or in .env at the repository root}"

# Host and database only, the credentials stay out of the terminal.
echo "Dropping the 'Config' collection from: $( echo "${mongoUri}" | sed -E 's#^(mongodb(\+srv)?://)([^@]*@)?#\1#' )"

mongosh "${mongoUri}" --eval "db.Config.drop()"
