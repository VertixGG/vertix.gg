export interface AuthUser {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    email?: string;
}

export interface Guild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;

    /**
     * Whether our own tables say the bot is in this server - a hint the picker sorts and labels by,
     * not the answer the dashboard locks itself on. That one is asked of Discord, per server, by
     * `BotPresenceGate`.
     *
     * Absent on the sentinel guild the interface editor runs against, which is not a Discord server
     * and has nobody to be in it. Undefined means unknown, and draws as neither.
     */
    hasBot?: boolean;
}

export interface SelectedGuild {
    id: string;
    name: string;
    icon: string | null;
}
