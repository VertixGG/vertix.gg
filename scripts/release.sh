# cd to project root
cd "$(dirname "$0")/.."

password=$(date +%s | openssl rand -base64 32)
zip -r -e -P "$password" project.zip ./dist/*
scp -P 7777 project.zip inewlegend@inewlegend.com:/home/inewlegend/Desktop/WWW/project.zip
echo unzip -P "$password" project.zip

rm -f project.zip
