import { ActivityType  } from "discord.js";

import type { GuildMember } from "discord.js";

export function getUserCurrentGame( member: GuildMember ): string | null {
    if ( !member.presence ) return null;

    const activity = member.presence.activities.find(
        activity => activity.type === ActivityType.Playing && !!activity.name
    );

    return activity?.name ?? null;
}
