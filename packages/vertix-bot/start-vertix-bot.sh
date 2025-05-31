#!/bin/bash

# Change to the project root directory first
cd /home/ec2-user/vertix.gg

# Export NVM directory and load it if it exists
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Add npm and bun to PATH
export PATH="$HOME/.npm/bin:$HOME/.bun/bin:/usr/local/bin:$PATH"

# Change to the bot directory
cd packages/vertix-bot

# Load environment variables from .env
if [ -f .env ]; then
    echo "Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "No .env file found in $(pwd)" >> logs/vertix-bot-error.log
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Add timestamp and debug info to log
{
    echo "=== Starting Vertix Bot at $(date) ==="
    echo "Current directory: $(pwd)"
    echo "Node version: $(node -v)"
    echo "Bun version: $(bun -v)"
    echo "User running script: $(whoami)"
    echo "PATH: $PATH"
    echo "Environment variables:"
    echo "NODE_ENV: $NODE_ENV"
    echo "BOT_PRISMA_DATABASE_URL: ${BOT_PRISMA_DATABASE_URL//:*@/:***@}"  # Hide sensitive parts
    echo "DISCORD_TOKEN: ${DISCORD_TOKEN:0:10}..." # Only show first 10 chars
} >> logs/vertix-bot.log 2>> logs/vertix-bot-error.log

# Make sure the log files are accessible
chmod 644 logs/vertix-bot.log logs/vertix-bot-error.log

# Test if bun is accessible
if ! which bun > /dev/null; then
    echo "Bun not found in PATH" >> logs/vertix-bot-error.log
    exit 1
fi

# Run the bot with output redirection
exec /usr/local/bin/bun run vertix-bot:bun:start:dev  2>&1 
