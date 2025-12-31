set -e

# Load .env if exists and BOT_PRISMA_DATABASE_URL is not set
if [ -z "${BOT_PRISMA_DATABASE_URL}" ] && [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

mongoUri="${BOT_PRISMA_DATABASE_URL:?BOT_PRISMA_DATABASE_URL is required}"

mongosh "${mongoUri}" --eval "db.Config.drop()"


