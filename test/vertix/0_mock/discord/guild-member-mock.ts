import { RawGuildMemberData } from "discord.js/typings/rawDataTypes";
import { GuildMember } from "discord.js";

import { ClientMock } from "./client-mock";

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
