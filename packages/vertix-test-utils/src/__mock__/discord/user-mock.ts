import { User } from "discord.js";

import type { RawUserData } from "@vertix.gg/test-utils/src/__mock__/discord/raw-data-types";

import type { ClientMock } from "@vertix.gg/test-utils/src/__mock__/discord/client-mock";

export class UserMock extends User {
    public constructor( client: ClientMock, data: RawUserData ) {
        super( client, data );
    }
}
