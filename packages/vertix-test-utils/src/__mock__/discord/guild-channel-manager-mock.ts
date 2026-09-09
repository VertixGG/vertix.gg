import { CachedManager, GuildChannel } from "discord.js";

import type { Guild, GuildChannelManager, GuildChannelResolvable, Snowflake } from "discord.js";
import type { RawGuildChannelData } from "@vertix.gg/test-utils/src/__mock__/discord/raw-data-types";

export class GuildChannelManagerMock extends CachedManager<Snowflake, GuildChannel, GuildChannelResolvable> {
    private guild: Guild;

    public constructor( guild: Guild, _iterable?: Iterable<RawGuildChannelData> ) {
        super( guild.client, GuildChannel );
        this.guild = guild;
    }

    public getFakeInstance(): GuildChannelManager {
        return this as unknown as GuildChannelManager;
    }
}
