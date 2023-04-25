### cd to project root
cd "$(dirname "$0")/.."

## generate a random password
password=$(date +%s | openssl rand -base64 64)

# generate random abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 file name
zipFileName=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1).zip

# compress the project root with the password, exclude 'dist', 'node_modules', 'coverage', '.git'
zip -r -e -P "$password" "$zipFileName" . -x "*node_modules/*" "*.git/*" "*.idea/*" "*.test/*" ".env" "dist/*" "coverage/*"

# upload
scp -P 7777 "$zipFileName" inewlegend@192.168.0.205:/home/inewlegend/Desktop/WWW/"$zipFileName"

# remove the zip file
rm -f "$zipFileName"

# print wget command
echo wget http://inewlegend.com/"$zipFileName"

## echo unzip command
echo unzip -P "$password" "$zipFileName"
