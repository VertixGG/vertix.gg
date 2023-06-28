use local
    var insertsCursor = db.oplog.rs.find({"op": "i"});

use discord;

var collections = [
    // "Guild",
    // "GuildData",
    // "Channel",
    // "ChannelData",
    "Category",
];

insertsCursor.forEach(function (oplogEntry) {
    if (!oplogEntry.ns.includes("discord.discord") && oplogEntry.ns.includes("discord.")) {
        var ns = oplogEntry.ns.replace("discord.", "");
var document = oplogEntry.o;  // Inserted document


        if ( collections.includes(ns) ) {
            try {
                // print(ns)
                db.getCollection(ns).insert(document);

} catch (error) {
                print("Error occurred during insert operation:", error);
}
        }
    }
});
