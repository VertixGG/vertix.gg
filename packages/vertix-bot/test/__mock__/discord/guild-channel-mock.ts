import { GuildChannel } from "discord.js";

import type { RawGuildChannelData } from "discord.js/typings/rawDataTypes";

import type { GuildMock } from "@vertix.gg/bot/test/__mock__/discord/guild-mock";

export class GuildChannelMock extends GuildChannel {
    public constructor( guild: GuildMock, data: RawGuildChannelData ) {
        super( guild.getFakeInstance(), data );
    }
}
