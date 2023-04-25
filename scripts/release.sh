# cd to project root
cd "$(dirname "$0")/.."

password=$(date +%s | openssl rand -base64 64)
zip -r -e -P "$password" project.zip ./dist/*
scp -P 7777 project.zip inewlegend@192.168.0.205:/home/inewlegend/Desktop/WWW/project.zip
echo unzip -P "$password" project.zip

rm -f project.zip
