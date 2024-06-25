# cd to project root
cd "$(dirname "$0")/.."

password=$(date +%s | openssl rand -base64 32)
zip -r -e -P "$password" project.zip ./dist/* -x "*.log" -x "*node_modules*"
scp -v -i /Users/inewlegend/Documents/leonid-vinikov-vertix-oregon.pem -P 22 project.zip ec2-user@ec2-35-94-88-148.us-west-2.compute.amazonaws.com:/home/ec2-user/project.zip

echo "-----------------------------"
date
echo "-----------------------------"

echo unzip -P "$password" project.zip

rm -f project.zip
