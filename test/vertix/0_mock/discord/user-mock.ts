import { User } from "discord.js";

import { RawUserData } from "discord.js/typings/rawDataTypes";

import { ClientMock } from "./client-mock";

export class UserMock extends User {
    public constructor( client: ClientMock, data: RawUserData ) {
        super( client, data );
    }
}
