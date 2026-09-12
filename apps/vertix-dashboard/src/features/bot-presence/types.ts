export interface GuildBotPresence {
    guildId: string;
    /**
     * Whether the bot is a member of the guild. Null when Discord could not be asked, which is the
     * absence of an answer rather than an answer of "no" - the dashboard stays open on it.
     */
    isBotInGuild: boolean | null;
}
