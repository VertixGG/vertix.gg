#!/bin/bash
export SENDGRID_API_KEY='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'

# Get the system timezone in the GMT format
timezone=$(date +%z)

# Find the highest existing log file number and add 1 to get the next log file number
log_num=$(ls -1 vertix.*.log 2>/dev/null | sed 's/vertix\.//;s/\.log//' | sort -n | tail -1)

if [ -n "$log_num" ]; then
  log_num=$((log_num + 1))
else
  log_num=1
fi

# Read execute file name from command line argument
file_name=$1

# If file name empty use default
if [ -z "$file_name" ]; then
  file_name="vertix-bot"
fi

# Check if the file exists
if [ ! -f "$file_name" ]; then
  echo "File not found: $file_name"
  exit 1
fi

while true; do
  # Run the process and redirect its output to the current log file
  log_file_name="vertix.$log_num.log"

  ./"$file_name" 2>&1 | tee "vertix.$log_num.log" &

  pid=$!

  # Wait for the process to exit
  wait $pid

  # Send email with log file attachment
  log_file_content=$(cat "$log_file_name" | tail -n 400 | base64)
  curl --request POST \
    --url https://api.sendgrid.com/v3/mail/send \
    --header "Authorization: Bearer $SENDGRID_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "personalizations": [
          {
            "to": [
              {
                "email": "czf.leo123@gmail.com"
              }
            ]
          }
        ],
        "from": {"email": "leoivangel@gmail.com"},
        "subject": "Vertix Log '"$(date +"%Y-%m-%d %T") $timezone"'",
        "content": [
          {
            "type": "text/plain",
            "value": "Attached is the latest Vertix log file."
          }
        ],
        "attachments": [
          {
            "content": "'"$(echo "$log_file_content" | sed ':a;N;$!ba;s/\n//g')"'" ,
            "filename": "'"$log_file_name"'"
          }
        ]
      }'

  # Increment the log file number for the next run
  log_num=$((log_num + 1))
done
