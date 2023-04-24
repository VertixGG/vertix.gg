#!/bin/bash

log_file="$1"
search_string="${2:-ADMIN}"

tail -f -n99999 "$log_file" | awk -v search="$search_string" '{
    if (index($0, "[" search "]") > 0) {
        message=substr($0, index($0,"]: ")+3);
        cmd="date +\"[%Y-%m-%d %H:%M:%S]\"";
        cmd | getline timestamp_local;
        close(cmd);
        print timestamp_local, message;
    }
}'
