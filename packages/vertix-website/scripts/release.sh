# cd to project root
cd "$(dirname "$0")/.."

password=$(date +%s | openssl rand -base64 32)
zip -r -e -P "$password" website.zip ./build/*
scp -oHostKeyAlgorithms=+ssh-dss -v -i /Users/inewlegend/Documents/id_rsa -P 21098 website.zip vertktbr@198.187.29.27:/home/vertktbr/website.zip
echo unzip -P "$password" website.zip

rm -f website.zip

