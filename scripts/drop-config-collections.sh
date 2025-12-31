set -e

mongoUri="${BOT_PRISMA_DATABASE_URL:?BOT_PRISMA_DATABASE_URL is required}"

mode="${1:-config}"

if [ "${mode}" = "--all" ]; then
    evalScript="db.Config.drop()
db.ChannelData.drop()
db.GuildData.drop()
db.UserData.drop()
db.UserChannelData.drop()"
else
    evalScript="db.Config.drop()"
fi

mongosh "${mongoUri}" --eval "${evalScript}"


