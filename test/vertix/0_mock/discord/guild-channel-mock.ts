import { GuildChannel } from "discord.js";
import { RawGuildChannelData } from "discord.js/typings/rawDataTypes";

import { GuildMock } from "./guild-mock";

export class GuildChannelMock extends GuildChannel {
    public constructor( guild: GuildMock, data: RawGuildChannelData ) {
        super( guild.getFakeInstance(), data );
    }
}
