/**
 * A dynamic channel somewhere in the claim lifecycle, as it survives a restart.
 *
 * Every step of that lifecycle used to live in the manager's own objects, so a restart put every
 * abandoned room back to nobody having left it: one still counting down stopped being watched and
 * was never offered at all, and one already offering itself kept the standing message inviting
 * people to press a button that now drew greyed out.
 *
 * Kept against the channel because that is what the lifecycle belongs to, and because the row goes
 * when the channel does - a record for a room that no longer exists cannot outlive it.
 */
export interface IDynamicChannelClaimStoredState {
    channelId: string;

    /**
     * When the owner left, rather than how much of the wait is left.
     *
     * The deadline is the guild's timeout counted from here, so a guild that changes its timeout
     * while a room is waiting has the change apply to that room too. Held as a remaining duration
     * it would instead be handed a fresh full wait by every restart, which on a bot that restarts
     * on deploy is how a room stays unclaimable for as long as deploys keep happening.
     */
    abandonedAt: number;

    /**
     * Whether the wait is already over and the claim message is standing.
     *
     * The two phases are exclusive - a room is either counting down or offering itself - so one
     * record carries both rather than a second appearing halfway through.
     */
    isClaimable: boolean;
}
