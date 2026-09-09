import type {
    APIChannel,
    APIGuild,
    APIGuildMember,
    APIPartialChannel,
    APIUnavailableGuild,
    APIUser
} from "discord-api-types/v10";

/**
 * The raw payload shapes the mocks construct from.
 *
 * discord.js declares these in `typings/rawDataTypes`, which its `exports` map does not expose - a
 * deep import into it resolves only while the package happens to sit hoisted at the workspace root.
 * Each type here is a subset of the union discord.js declares, so a value still satisfies the
 * constructor the mock passes it to.
 */
export type RawUserData = APIUser & { member?: Omit<APIGuildMember, "user"> };

export type RawGuildData = APIGuild | APIUnavailableGuild;

export type RawGuildMemberData = APIGuildMember | { user: { id: string } };

export type RawGuildChannelData = APIChannel | Required<APIPartialChannel>;
