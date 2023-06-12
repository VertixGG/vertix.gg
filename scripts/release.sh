# cd to project root
cd "$(dirname "$0")/.."

password=$(date +%s | openssl rand -base64 32)
zip -r -e -P "$password" project.zip ./dist/*
scp -v -i /Users/inewlegend/Documents/leonid-vinikov.pem -P 22 project.zip ec2-user@ec2-3-83-214-57.compute-1.amazonaws.com:/home/ec2-user/project.zip

echo "-----------------------------"
date
echo "-----------------------------"

echo unzip -P "$password" project.zip

rm -f project.zip
