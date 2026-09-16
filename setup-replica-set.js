// Run this in MongoDB shell to initialize replica set
//
// `host` is what the set advertises to clients, not what mongod listens on - a client that asks
// the set where to go is sent here by name. Written down as a literal it goes stale the next time
// the machine's address moves, and the client is told to dial somewhere nothing answers; the set
// reports no primary and every query fails on a timeout rather than on anything that names the
// cause. Passed in, it is whatever the machine currently calls itself:
//
//   RS_HOST="$( hostname ):27017" mongosh --file setup-replica-set.js
//
// or `bun run vertix:db:replica-set:init`, which is that line.

const host = process.env.RS_HOST || "localhost:27017";

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host }
  ]
});
