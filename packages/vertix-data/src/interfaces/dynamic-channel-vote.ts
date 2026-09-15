import type { TVoteTimings } from "@vertix.gg/definitions/src/guild-timings-definitions";

/**
 * A claim vote as it survives a restart.
 *
 * The vote lived entirely in the manager's own objects, and the message it is drawn on lives in
 * discord - so a restart left the two on either side of a gap nothing could close. The message
 * went on standing with its buttons, the manager had no idea there was a vote, and every press
 * came back "channel not running": the room was never handed over, and the countdown on the
 * message never moved again.
 *
 * Only what a vote is actually made of is kept. The manager also held the interaction each press
 * arrived on, which cannot be stored and was never read for anything but the id of whoever it
 * belonged to - so it is ids that are held here, and ids that the manager keeps now.
 */
export interface IDynamicChannelVoteStoredState {
    channelId: string;

    /**
     * The message the vote is drawn on.
     *
     * A claim vote has no message of its own: it appears by editing the one whose claim button was
     * pressed. Without this a restored vote has nothing to redraw, so it is the one fact the
     * manager did not hold at all and had to be given.
     */
    messageId: string;

    /** Who opened the vote, which is who a tie goes to. */
    initiatorId: string;

    startedAt: number;

    /**
     * When the vote closes, as a moment rather than a duration.
     *
     * Stepping in extends it, so this moves while the vote runs and is written down again each
     * time. Held absolute so a vote that ended during an outage is seen to have ended, rather than
     * being handed its remaining time over again.
     */
    endsAt: number;

    isInitialInterval: boolean;
    isInitialCandidate: boolean;

    /** The timings this vote settled on when it started, which a guild may since have changed. */
    timings: TVoteTimings;

    /** Everyone who stepped in, whether or not anybody voted for them. */
    candidateIds: string[];

    /** Who voted for whom, by voter id. */
    votes: Record<string, string>;
}
