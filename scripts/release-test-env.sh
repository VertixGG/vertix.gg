password=$(date +%s | base64 | head -c 32)
zip -r -e -P "$password" project.zip . -x "*node_modules/*" "*.git/*" "*.idea/*" "*.test/*" ".env"
scp -P 7777 project.zip inewlegend@192.168.0.205:/home/inewlegend/Desktop/dynamico/project.zip
echo unzip -P "$password" project.zip
