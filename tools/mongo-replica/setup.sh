# List existing mongo process
pgrep mongo
# Kill existing process if has.
pkill mongo
# Clear old folder if has.
rm -rf rs0 && rm -rf rs1 && rm -rf rs2
# Create log folder.
mkdir -p ./var/log/mongodb
# Create replica set 0
sh rs.sh 0
# Create replica set 1
sh rs.sh 1
# Create replica set 2
sh rs.sh 2
# List existing mongo process
pgrep mongosh
# Connect to available host
mongoosh
# then run: rs.initiate({_id:"rs0", members: [{_id:0, host:"127.0.0.1:27017", priority:100}, {_id:1, host:"127.0.0.1:27018", priority:50}, {_id:2, host:"127.0.0.1:27019", arbiterOnly:true}]})

