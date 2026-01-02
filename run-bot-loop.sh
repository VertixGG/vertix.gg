#!/bin/bash

counter=0

while true; do
    if [ $counter -eq 0 ]; then
        logfile="vertix.log"
    else
        logfile="vertix.$counter.log"
    fi
    
    while [ -f "$logfile" ]; do
        counter=$((counter + 1))
        if [ $counter -eq 1 ]; then
            logfile="vertix.1.log"
        else
            logfile="vertix.$counter.log"
        fi
    done
    
    echo "Starting bot - logging to $logfile"
    bun run vertix:bot:bun:start:dev > "$logfile" 2>&1
    
    counter=$((counter + 1))
    echo "Bot stopped. Restarting in 3 seconds..."
    sleep 3
done
