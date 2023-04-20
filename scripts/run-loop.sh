#!/bin/bash
export SENDGRID_API_KEY='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'

# Get the system timezone in the GMT format
timezone=$(date +%z)

# Find the highest existing log file number and add 1 to get the next log file number
log_num=$(ls -1 dynamico.*.log 2>/dev/null | sed 's/dynamico\.//;s/\.log//' | sort -n | tail -1)
if [ -n "$log_num" ]; then
  log_num=$((log_num + 1))
else
  log_num=1
fi

while true; do
  # Run the process and redirect its output to the current log file
  log_file_name="dynamico.$log_num.log"
  ./dynamico-bot 2>&1 | tee "dynamico.$log_num.log" &
  pid=$!

  # Wait for the process to exit
  wait $pid

  # Send email with log file attachment
  log_file_content=$(cat "$log_file_name" | tail -n 50 | base64)
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
              },
              {
                "email": "gal660@gmail.com"
              },
            ]
          }
        ],
        "from": {"email": "leoivangel@gmail.com"},
        "subject": "Dynamico Log '"$(date +"%Y-%m-%d %T") $timezone"'",
        "content": [
          {
            "type": "text/plain",
            "value": "Attached is the latest Dynamico log file."
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
