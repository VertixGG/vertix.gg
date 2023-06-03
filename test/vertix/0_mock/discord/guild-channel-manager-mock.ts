import { CachedManager, Guild, GuildChannel, GuildChannelManager, GuildChannelResolvable, Snowflake } from "discord.js";
import { RawGuildChannelData } from "discord.js/typings/rawDataTypes";

export class GuildChannelManagerMock extends CachedManager<Snowflake, GuildChannel, GuildChannelResolvable> {
    private guild: Guild;

    public constructor(guild: Guild, iterable?: Iterable<RawGuildChannelData>) {
        super( guild.client, GuildChannel );
        this.guild = guild;
    }

    public getFakeInstance(): GuildChannelManager {
        return this as unknown as GuildChannelManager;
    }
}
