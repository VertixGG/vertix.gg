import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/**
 * The names the claim manager gives the answers it hands back.
 *
 * The flow's conditions are written against these, so saying which one applies is the whole of
 * what a demonstration has to decide - the wording of each is the bot's.
 */
const OUTCOME_OWNER_STOP = "OwnerStop",
    OUTCOME_ADDED = "AddedSuccessfully",
    OUTCOME_ALREADY_ADDED = "AlreadyAdded",
    OUTCOME_VOTED = "VoteSuccess",
    OUTCOME_VOTED_SAME = "VoteSameChoice",
    OUTCOME_VOTE_UPDATED = "VoteUpdated",
    OUTCOME_SELF_VOTE = "VoteAlreadySelf";

/**
 * The words the won message has for itself, named by the tokens it defines.
 *
 * Its own working out is the one piece of these three messages the exporter could not carry, so
 * the page says which of its answers applies and the embed supplies the wording. The vote message
 * needs none of this: it is told the tally and decides the rest for itself.
 */
const WON_FROM_SOMEBODY_ELSE = "{wonSomeoneElse}",
    WON_BY_SAME_OWNER = "{wonSameOwner}",
    NO_RESULTS_LINK = "{resultsDefault}";

const ABSENT_OWNER = DEMO_OWNER,
    ALEX = "Alex",
    JORDAN = "Jordan";

const AVATARS: Readonly<Record<string, string>> = {
    [ ABSENT_OWNER ]: DEMO_MEMBERS.owner.avatar,
    [ ALEX ]: DEMO_MEMBERS.alex.avatar,
    [ JORDAN ]: DEMO_MEMBERS.jordan.avatar
};

/**
 * How long the room gets to decide, once somebody has put themselves forward.
 *
 * The bot gives it minutes, and takes the number from the guild's own settings. A minute and a
 * half is what anybody is going to sit through - and it is long enough to start out counted in
 * minutes, so the message is seen doing both halves of its own counting.
 */
const VOTE_WINDOW_MS = 90 * 1000;

/** How long the owner has to have been gone for any of this to start. */
const ABSENT_MINUTES = "5.0";

type Stage = "start" | "stepIn" | "vote" | "won" | "stopped";

export default function ClaimChannel() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    /**
     * The one message everybody in the channel is looking at.
     *
     * A claim is the only thing the bot does in the open: it lands in the channel, under the panel
     * that was already there, where the whole room can see it - and what each person gets back for
     * pressing it is theirs alone. Both halves are below, three times over - once per person.
     */
    const [ stage, setStage ] = React.useState<Stage>( "start" );

    const [ candidates, setCandidates ] = React.useState<ReadonlyArray<string>>( [] );

    /** Who each person has voted for, which is what makes pressing it again a repeat. */
    const [ votes, setVotes ] = React.useState<Readonly<Record<string, string>>>( {} );

    /**
     * When the room runs out of time, which is set going by the first person to put themselves
     * forward - that press is what opens the window, here as in the bot.
     */
    const [ endsAt, setEndsAt ] = React.useState<number | null>( null );

    const handleReset = () => {
        setStage( "start" );
        setCandidates( [] );
        setVotes( {} );
        setEndsAt( null );
        setRunKey( ( key ) => key + 1 );
    };

    /**
     * Nothing anybody presses ends a vote - the clock does, and this is it running out.
     *
     * The counting on screen is not this: each claim message is told when the window closes and
     * counts itself down to it. This is only the moment it reaches, which the room has to be told
     * about because it is what settles who owns the channel.
     *
     * Unopposed or not: whoever is ahead when the window closes takes it, which is why a single
     * candidate left alone simply wins.
     */
    React.useEffect( () => {
        if ( null === endsAt ) {
            return;
        }

        const closes = window.setTimeout(
            () => setStage( ( current ) => "stepIn" === current || "vote" === current ? "won" : current ),
            Math.max( 0, endsAt - Date.now() )
        );

        return () => window.clearTimeout( closes );
    }, [ endsAt ] );

    const countVotes = ( name: string ) => Object.values( votes ).filter( ( to ) => to === name ).length;

    /** Whoever put themselves forward first, who is the one the vote message favours in a tie. */
    const initiator = candidates[ 0 ] ?? ALEX;

    /** Who takes the channel, counted the way the vote message says it will be. */
    const winner = candidates.reduce(
        ( leader, name ) => countVotes( name ) > countVotes( leader ) ? name : leader,
        initiator
    );

    /** Whose channel it is, which is the only thing a claim changes. */
    const owner = "won" === stage ? winner : ABSENT_OWNER;

    /**
     * The running tally, which is the one thing the vote message is actually told.
     *
     * How many candidates there are, which of its two sentences that calls for, and the list itself
     * - one to a line, most votes first, each named and counted - are all the embed's own working
     * out from this. It is passed as the bot passes it, a count per candidate.
     */
    const results = Object.fromEntries( candidates.map( ( name ) => [ name, countVotes( name ) ] ) );

    /** What has landed in the channel under the panel, at whatever stage it has got to. */
    const claimMessage = {
        start: { flowName: "VertixBot/UI-V3/ClaimStartFlow", stateKey: "VertixBot/UI-V3/ClaimStartFlow/States/Default" },
        stepIn: { flowName: "VertixBot/UI-V3/ClaimVoteFlow", stateKey: "VertixBot/UI-V3/ClaimVoteFlow/States/StepIn" },
        vote: { flowName: "VertixBot/UI-V3/ClaimVoteFlow", stateKey: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteProcess" },
        won: { flowName: "VertixBot/UI-V3/ClaimVoteFlow", stateKey: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteWon" },
        // Called off, and the bot deletes what it posted - so the channel is the panel again.
        stopped: undefined
    }[ stage ];

    /** What that message offers here, and so what anybody looking at it can press. */
    const stageButtons = {
        start: [ "VertixBot/UI-V3/ClaimStartButton" ],
        stepIn: [ "VertixBot/UI-V3/ClaimVoteStepInButton" ],
        vote: [ "VertixBot/UI-V3/ClaimVoteAddButton", "VertixBot/UI-V3/ClaimVoteStepInButton" ],
        won: [],
        stopped: []
    }[ stage ];

    /**
     * What the bot would tell this person for pressing what they pressed.
     *
     * The claim manager works this out from who they are, which button it was and what they have
     * already done; the conditions on the result flow are written against the answer, so this is
     * where that answer is decided and the flow is left to pick the message for it.
     */
    const outcomeFor = ( person: string, votedFor?: string ): string => {
        // The owner turning up calls the whole thing off - but only while nobody has claimed yet.
        // Once there is a vote on, the manager stops asking whose channel it is and treats them as
        // one more person in the room.
        if ( "start" === stage && ABSENT_OWNER === person ) {
            return OUTCOME_OWNER_STOP;
        }

        // Nothing was voted for, so it was the claim button or Step in - both of which are ways of
        // putting yourself forward, and both answered by whether you already have.
        if ( !votedFor ) {
            return candidates.includes( person ) ? OUTCOME_ALREADY_ADDED : OUTCOME_ADDED;
        }

        if ( votedFor === person ) {
            return OUTCOME_SELF_VOTE;
        }

        if ( votes[ person ] === votedFor ) {
            return OUTCOME_VOTED_SAME;
        }

        return votes[ person ] ? OUTCOME_VOTE_UPDATED : OUTCOME_VOTED;
    };

    /** What that answer does to the room, once the flow has said which answer it is. */
    const applyOutcome = ( person: string, outcome: string, votedFor?: string ) => {
        if ( OUTCOME_OWNER_STOP === outcome ) {
            setStage( "stopped" );

            return;
        }

        if ( OUTCOME_ADDED === outcome ) {
            const next = [ ...candidates, person ];

            setCandidates( next );

            // The first of them starts the clock, and it runs from there however many follow.
            if ( 1 === next.length ) {
                setEndsAt( Date.now() + VOTE_WINDOW_MS );
            }

            // One candidate is a walkover; two is an election, and the message says so.
            setStage( next.length > 1 ? "vote" : "stepIn" );

            return;
        }

        if ( votedFor && ( OUTCOME_VOTED === outcome || OUTCOME_VOTE_UPDATED === outcome ) ) {
            setVotes( ( current ) => ( { ...current, [ person ]: votedFor } ) );
        }
    };

    /**
     * What to tell somebody watching, which here is about the message rather than about a person.
     *
     * Every other feature is one person's exchange with the bot, so the simulator reports where
     * that person stands and the page prints it. A claim is the room's: the screens are on the same
     * message and each has an answer of their own, and none of them is the one to narrate. So the
     * stage does, and what the bot told each of them privately is left to speak for itself on the
     * screen it was said on.
     */
    const guidance = {
        start: {
            title: <>Press <b>Claim</b> on any of the three</>,
            body: <>
                { ABSENT_OWNER } has been gone { ABSENT_MINUTES } minutes, so the bot has posted this under their
                panel. Whoever presses it is told privately what it did for them — and if it is { ABSENT_OWNER },
                that is the whole thing called off.
            </>
        },
        stepIn: {
            title: <>{ initiator } is in line for it, and the clock is running</>,
            body: <>
                Unopposed, they get it when it runs out — a minute and a half, counted down in the message
                itself, in minutes until there is under one left and in seconds after that.
                Press <b>Step in</b> on another screen to make a contest of it, or on the same one to be told you
                are already in. { ABSENT_OWNER } has left it too late: the vote is on, and pressing now only puts
                them in the running like anybody else.
            </>
        },
        vote: {
            title: "Two candidates, and the room decides",
            body: <>
                One button per candidate, the same row on every screen — so try voting for the same person twice,
                changing your mind, and voting for yourself. <b>Step in</b> still answers, and still says you are
                in. Nothing on screen ends it: the message is counting down, and whoever is ahead when it reaches
                zero takes the channel.
            </>
        },
        won: {
            title: <>{ winner } has the channel</>,
            body: <>
                Said in the channel, to everybody who was looking at it — and the panel above it is { winner }&apos;s
                now. Nobody pressed anything to bring it about, so there is nothing private this time.
            </>
        },
        stopped: {
            title: <>{ ABSENT_OWNER } came back, and it is off</>,
            body: <>
                The message the bot posted is gone from the channel — deleted, not answered — and the panel is
                where it always was. Only { ABSENT_OWNER } was told anything, and only they could have done this.
            </>
        }
    }[ stage ];

    /** A screen, from one person's side of the same channel. */
    const screenFor = ( person: string ) => (
        <DiscordAppFrame
            channelName={ DEMO_CHANNEL_NAME }
            sidebar={
                <DynamicChannelV3Sidebar
                    channel={ {
                        name: DEMO_CHANNEL_NAME,
                        active: true,
                        timer: "26:08",
                        // The room is still here whether or not its owner is, which is the
                        // whole reason there is anybody to claim it.
                        users: ( "stopped" === stage ? [ ABSENT_OWNER, ALEX, JORDAN ] : [ ALEX, JORDAN ] )
                            .map( ( name ) => ( { id: name, username: name, avatar: AVATARS[ name ]! } ) )
                    } }
                />
            }
        >
            <DiscordFlowSimulator
                // Not keyed on the stage: the claim message changing above somebody must not take
                // away the private answer they were just given, which is what Discord does - the
                // channel message is edited, and their reply sits there until they dismiss it.
                key={ `${ person }-${ runKey }` }
                // The panel, which was in the channel before any of this and stays there after it.
                entry={ {
                    flowName: "VertixBot/UI-V3/DynamicChannelFlow",
                    stateKey: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                    componentName: "VertixBot/UI-V3/DynamicChannel",
                    mentionUser: owner,
                    variables: {
                        ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                        claimEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.claimChannel,
                        name: DEMO_CHANNEL_NAME,
                        ownerId: ABSENT_OWNER,
                        ownerDisplayName: ABSENT_OWNER,
                        absentMinutes: ABSENT_MINUTES,
                        userInitiatorId: initiator,
                        userInitiatorDisplayName: initiator,
                        // When the window closes, which is all either claim message needs: each
                        // counts itself down to it, by the method the bot exported with it.
                        timeEnd: String( endsAt ?? Date.now() + VOTE_WINDOW_MS ),
                        userWonId: winner,
                        userWonDisplayName: winner,
                        previousOwnerDisplayName: ABSENT_OWNER,
                        // An owner who left it too late can still win their own channel back, and
                        // the embed has its own sentence for that.
                        wonMessage: ABSENT_OWNER === winner ? WON_BY_SAME_OWNER : WON_FROM_SOMEBODY_ELSE,
                        /*
                         * The tally, which the vote message reads and works its whole list out of.
                         *
                         * The won message is handed the same name and means something else by it -
                         * the offer of a breakdown to click through to - and works that out in a
                         * function the exporter could not carry, because it reaches for a link only
                         * the bot can make. So at that point the answer is given instead of the
                         * question, which is the one place on this page that is still necessary.
                         */
                        results: "won" === stage ? NO_RESULTS_LINK : JSON.stringify( results )
                    }
                } }
                // The claim was not opened by pressing anything - it arrived underneath the panel
                // because the bot gave up waiting for its owner.
                opensAt={ claimMessage }
                // The panel is nobody's to press here: this is about the message under it.
                allowedElements={ stageButtons }
                author="VoiceChannels"
                avatar={ VertixAvatar }
                interactionUser={ person }
                interactionUserAvatar={ AVATARS[ person ] }
                steps={ {
                    // The bot draws a vote button per candidate out of the one the component
                    // declares, each named after whom it is a vote for - which is how its handler
                    // reads the target back off the press. So the candidates are named here, and
                    // the wording of each button stays the button's own.
                    "VertixBot/UI-V3/ClaimVoteFlow/States/VoteProcess": {
                        elements: {
                            "VertixBot/UI-V3/ClaimVoteAddButton": candidates.map( ( name ) => ( {
                                key: name,
                                variables: { displayName: name }
                            } ) )
                        }
                    },
                    // Pressing hands off to the answers flow, which says nothing until it is told
                    // which answer this person earned - so it is told on arrival, by who they
                    // pressed for, if anybody.
                    "VertixBot/UI-V3/ClaimResultFlow/States/Default": {
                        values: ( _triggeredBy, votedFor ) => ( {
                            claimResult: outcomeFor( person, votedFor ),
                            votedFor: votedFor ?? "",
                            previouslyVotedFor: votes[ person ] ?? ""
                        } ),
                        // Whoever the vote was for, for the answer that names them - and who it
                        // used to be, for the one that says it has changed.
                        toVariables: ( values ): Readonly<Record<string, string>> => values.votedFor
                            ? {
                                userDisplayName: values.votedFor,
                                userId: values.votedFor,
                                prevUserId: values.previouslyVotedFor,
                                currentUserId: values.votedFor
                            }
                            : {},
                        onTransition: ( _name, values ) => applyOutcome( person, values.claimResult, values.votedFor )
                    }
                } }
            />
        </DiscordAppFrame>
    );

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.claimChannel }
                        alt="Claim"
                        fallback="👑"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Claim a Channel</h3>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={ handleReset }
                        className="inline-flex items-center whitespace-nowrap rounded-md border border-white/15
                            bg-white/5 px-4 py-2 text-h5 transition-colors hover:bg-white/10"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-4">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="mb-3">
                                <strong>
                                    When an owner walks off and stays gone, the channel goes up for grabs. This is the
                                    one thing the bot does in the open: the same message for the whole room, and a
                                    private answer to each person who presses it. Three screens, one message.
                                </strong>
                            </p>

                            <p className="mb-0">
                                <strong className="text-vc-ice">{ guidance.title }</strong>
                                { guidance.body && <> — { guidance.body }</> }
                            </p>
                        </div>
                    </div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ ALEX }&apos;s screen</strong>
                        <span className="text-vc-ice-dim"> — still in the channel the owner left</span>
                    </p>

                    <div className="mb-6">{ screenFor( ALEX ) }</div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ JORDAN }&apos;s screen</strong>
                        <span className="text-vc-ice-dim"> — the same message, their own answers</span>
                    </p>

                    <div className="mb-6">{ screenFor( JORDAN ) }</div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ ABSENT_OWNER }&apos;s screen</strong>
                        <span className="text-vc-ice-dim"> — the owner, back before it is too late</span>
                    </p>

                    <div className="mb-6">{ screenFor( ABSENT_OWNER ) }</div>

                    <div className="text-h5 text-vc-ice-dim">
                        <p className="mb-0">
                            Ownership is all that moves. The channel keeps its name, its settings and everybody in
                            it — and the panel goes on being the same message, addressed to whoever owns the channel
                            now.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
