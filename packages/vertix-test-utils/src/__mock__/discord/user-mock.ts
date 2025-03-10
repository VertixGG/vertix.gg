import { User } from "discord.js";

import type { RawUserData } from "discord.js/typings/rawDataTypes";

import type { ClientMock } from "@vertix.gg/bot/test/__mock__/discord/client-mock";

export class UserMock extends User {
    public constructor ( client: ClientMock, data: RawUserData ) {
        super( client, data );
    }
}
