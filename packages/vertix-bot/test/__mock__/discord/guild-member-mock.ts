import type { RawGuildMemberData } from "discord.js/typings/rawDataTypes";
import type { GuildMember } from "discord.js";

import type { ClientMock } from "@vertix.gg/bot/test/__mock__/discord/client-mock";

export class GuildMemberMock {
    private client: ClientMock;
    private data: RawGuildMemberData;

    public displayName: string;

    public constructor( client: ClientMock, data: RawGuildMemberData | any ) {
        this.client = client;
        this.data = data;

        this.displayName = data.nick;
    }

    public getFakeInstance(): GuildMember {
        return this as unknown as GuildMember;
    }

    public displayAvatarURL( { format, size = 512 }: { format?: string, size?: number } = {} ): string {
        return `https://picsum.photos/${ size }`;
    }
}
