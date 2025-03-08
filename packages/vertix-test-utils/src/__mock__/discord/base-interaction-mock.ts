import { BaseInteraction } from "discord.js";

import type { Client } from "discord.js";

export class BaseInteractionMock extends BaseInteraction {
    public constructor(client: Client<true>, data: any) {
        super(client, data);
    }

    public getUser() {
        return this.user;
    }
}
