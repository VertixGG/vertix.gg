import { Client } from "discord.js";

export class ClientMock extends Client<true> {
    public constructor( options: any = {} ) {
        super( {
            allowedMentions: undefined,
            closeTimeout: 0,
            failIfNotExists: false,
            intents: [],
            partials: [],
            presence: undefined,
            rest: undefined,
            shardCount: 1,
            shards: undefined,
            sweepers: undefined,
            waitGuildTimeout: 0,
            ws: undefined,
            ... options,
        } );
    }
}
