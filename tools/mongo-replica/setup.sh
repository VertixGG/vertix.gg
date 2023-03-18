# List existing mongo process
pgrep mongo
# Kill existing process if has.
pkill mongo
# Clear old folder if has.
rm -rf rs0 && rm -rf rs1 && rm -rf rs2
# Create replica set 0
sh rs.sh 0
# List existing mongo process
pgrep mongosh
# Echo
cat rs.init
# Connect to available host
mongosh

