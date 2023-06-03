brew services stop mongodb/brew/mongodb-community

rm -rf rs0
sh rs.sh 0

brew services start mongodb/brew/mongodb-community

mongosh --eval "load('rs.init')"


