import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame, DiscordMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

const GUILD_NAME = "Vertix",
    KNOCKER_NAME = DEMO_MEMBERS.alex.username;

/** Who is in the channel — the owner, with the door shut behind them. */
const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner ];

export default function KnockChannel() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /**
     * The three moments a knock passes through, each on a different person's screen.
     *
     * Somebody asks, the owner is asked, and the asker is told. Only the middle one is a message
     * the owner ever sees, and only the last is one the asker sees, so the page holds what passes
     * between them and draws all three.
     */
    const [ knocked, setKnocked ] = React.useState( false );

    const [ answer, setAnswer ] = React.useState<"allowed" | "denied" | null>( null );

    const handleReset = () => {
        setKnocked( false );
        setAnswer( null );
        setRunKey( ( key ) => key + 1 );
    };

    const knockerSidebar = (
        <DynamicChannelV3Sidebar
            channel={ {
                name: DEMO_CHANNEL_NAME,
                // Alex can see it and cannot get in, which is the whole reason to knock.
                locked: "allowed" !== answer,
                users: CHANNEL_MEMBERS
            } }
        />
    );

    /**
     * The same channel from inside it.
     *
     * The owner is sitting in the room being knocked on, so their column shows them connected to it
     * - and shows the answer arriving as a person, since somebody let in walks in.
     */
    const ownerSidebar = (
        <DynamicChannelV3Sidebar
            channel={ {
                name: DEMO_CHANNEL_NAME,
                active: true,
                locked: true,
                timer: "26:08",
                users: "allowed" === answer
                    ? [ ...CHANNEL_MEMBERS, DEMO_MEMBERS.alex ]
                    : CHANNEL_MEMBERS
            } }
        />
    );

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.knockChannel }
                        alt="Knock"
                        fallback="🚪"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Knock on a Channel</h3>
                </div>

                <button
                    type="button"
                    onClick={ handleReset }
                    className="inline-flex items-center whitespace-nowrap rounded-md border border-white/15
                        bg-white/5 px-4 py-2 text-h5 transition-colors hover:bg-white/10"
                >
                    Reset
                </button>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-4">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="mb-3">
                                <strong>
                                    Knocking is asking to be let in. It passes through three screens — { KNOCKER_NAME }{ " " }
                                    asks, { DEMO_OWNER } is asked, { KNOCKER_NAME } is told — and all three are below.
                                </strong>
                            </p>

                            { guidance && (
                                <p className="mb-0">
                                    <strong className="text-vc-ice">{ guidance.title }</strong>
                                    { guidance.body && <> — { guidance.body }</> }
                                </p>
                            ) }
                        </div>
                    </div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ KNOCKER_NAME }&apos;s screen</strong>
                        <span className="text-vc-ice-dim"> — outside, looking at a channel they cannot join</span>
                    </p>

                    <div className="mb-6">
                        <DiscordAppFrame sidebar={ knockerSidebar }>
                            <DiscordFlowSimulator
                                key={ `knocker-${ runKey }` }
                                onGuidance={ setGuidance }
                                entry={ {
                                    flowName: "VertixBot/UI-V3/DynamicChannelFlow",
                                    stateKey: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                                    componentName: "VertixBot/UI-V3/DynamicChannel",
                                    mentionUser: DEMO_OWNER,
                                    variables: {
                                        ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                        knockEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.knockChannel,
                                        name: DEMO_CHANNEL_NAME,
                                        state: "🚫 Private"
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelKnockButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ KNOCKER_NAME }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 🚪 Knock )</b> — it is lit up for you</>,
                                        body: `You are ${ KNOCKER_NAME } here, not the owner. The channel is private, so the panel's other buttons are not yours to press.`
                                    },
                                    "VertixBot/UI-V3/DynamicChannelKnockFlow/States/SelectChannel": {
                                        title: "Pick the channel you want into",
                                        body: "Its owner is the one who decides, and you are told either way."
                                    },
                                    Sent: {
                                        title: "Asked — now it is out of your hands",
                                        body: `The request is on ${ DEMO_OWNER }'s screen below. Answer it there.`
                                    },
                                    Waiting: { title: "You already asked, and it has not been answered yet" },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelKnockFlow/States/SelectChannel": {
                                        menus: {
                                            "VertixBot/UI-V3/DynamicChannelKnockChannelMenu": {
                                                options: [ {
                                                    label: DEMO_CHANNEL_NAME,
                                                    description: `${ DEMO_OWNER } · private`,
                                                    values: { knockedChannelName: DEMO_CHANNEL_NAME }
                                                } ]
                                            }
                                        },
                                        onTransition: ( transitionName ) => {
                                            if ( "VertixBot/UI-V3/DynamicChannelKnockFlow/Transitions/Sent" === transitionName ) {
                                                setKnocked( true );
                                            }
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ DEMO_OWNER }&apos;s screen</strong>
                        <span className="text-vc-ice-dim"> — sitting in the channel being knocked on</span>
                    </p>

                    <div className="mb-6">
                        <DiscordAppFrame sidebar={ ownerSidebar }>
                            {
                                /*
                                 * Always drawn, knock or no knock: the panel is a message sitting in
                                 * the owner's channel whether or not anybody is at the door. It is
                                 * remounted when one arrives, because the request is a new message
                                 * appearing under it rather than a change to what was there.
                                 */
                            }
                            <DiscordFlowSimulator
                                key={ `owner-${ runKey }-${ knocked ? "asked" : "quiet" }` }
                                // The knocker's side leads until there is something to answer.
                                onGuidance={ knocked ? setGuidance : undefined }
                                // The owner is in their own channel, so their panel is the
                                // message at the top, as it is on every other screen here.
                                entry={ {
                                    flowName: "VertixBot/UI-V3/DynamicChannelFlow",
                                    stateKey: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                                    componentName: "VertixBot/UI-V3/DynamicChannel",
                                    mentionUser: DEMO_OWNER,
                                    variables: {
                                        ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                        knockEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.knockChannel,
                                        knockerId: KNOCKER_NAME,
                                        knockerDisplayName: KNOCKER_NAME,
                                        name: DEMO_CHANNEL_NAME,
                                        state: "🚫 Private"
                                    }
                                } }
                                // The request is not reached by pressing anything - it arrived
                                // underneath the panel because somebody knocked.
                                opensAt={ knocked ? { flowName: "VertixBot/UI-V3/DynamicChannelKnockRequestFlow", stateKey: "VertixBot/UI-V3/DynamicChannelKnockRequestFlow/States/Default" } : undefined }
                                // None of the panel's buttons belong to this demonstration.
                                allowedElements={ [] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelKnockRequestFlow/States/Default": {
                                        title: <>{ KNOCKER_NAME } is at the door — <b>👍 Yes</b> or <b>👎 No</b></>,
                                        body: "Yes grants the same access the permissions menu does. Ignoring it answers too: the request expires on its own."
                                    },
                                    Answered: {
                                        title: "Answered — and they have been told",
                                        body: `Look at ${ KNOCKER_NAME }'s messages below. It never says who decided, which is the owner's business rather than an invitation to argue.`
                                    }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelKnockRequestFlow/States/Default": {
                                        highlight: [ "VertixBot/UI-General/YesButton", "VertixBot/UI-General/NoButton" ],
                                        // Which of the two it was, and nothing about how the answer
                                        // is worded: the embed decides that from this and says it.
                                        buttons: {
                                            "VertixBot/UI-General/YesButton": () => ( {
                                                knockerDisplayName: KNOCKER_NAME,
                                                isKnockAllowed: "true"
                                            } ),
                                            "VertixBot/UI-General/NoButton": () => ( {
                                                knockerDisplayName: KNOCKER_NAME,
                                                isKnockAllowed: "false"
                                            } )
                                        },
                                        toVariables: ( values ) => ( { isKnockAllowed: values.isKnockAllowed } ),
                                        onTransition: ( transitionName ) => {
                                            setAnswer( "VertixBot/UI-V3/DynamicChannelKnockRequestFlow/Transitions/Allow" === transitionName ? "allowed" : "denied" );
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ KNOCKER_NAME }&apos;s direct messages</strong>
                        <span className="text-vc-ice-dim"> — told either way</span>
                    </p>

                    <DiscordAppFrame>
                        <div className="discord-chat-container vc-frame-box m-0">
                            { answer ? (
                                /*
                                 * What the bot writes back to whoever knocked. The wording is the
                                 * handler's own - it composes this rather than drawing an embed -
                                 * and it never says who decided, which is deliberate.
                                 */
                                <DiscordMessage
                                    author="VoiceChannels"
                                    avatar={ VertixAvatar }
                                    timestamp="Today at 12:01 PM"
                                >
                                    { "allowed" === answer ? (
                                        <>
                                            🚪 You were let into <strong>{ DEMO_CHANNEL_NAME }</strong> in{ " " }
                                            <strong>{ GUILD_NAME }</strong>.
                                            <br/>
                                            <span className="discord-mention-pill">#{ DEMO_CHANNEL_NAME }</span>
                                        </>
                                    ) : (
                                        <>
                                            🚪 Your request to join <strong>{ DEMO_CHANNEL_NAME }</strong> in{ " " }
                                            <strong>{ GUILD_NAME }</strong> was not accepted.
                                        </>
                                    ) }
                                </DiscordMessage>
                            ) : (
                                <p className="text-h5 text-vc-ice-dim m-0 p-4">
                                    Nothing yet. Once { DEMO_OWNER } answers, { KNOCKER_NAME } is told here — and only
                                    that it was answered, never by whom.
                                </p>
                            ) }
                        </div>
                    </DiscordAppFrame>

                    { "allowed" === answer && (
                        <p className="text-h5 text-vc-ice-dim mt-4 mb-0">
                            Look at both columns: the padlock is off { KNOCKER_NAME }&apos;s copy of the channel, and
                            they are standing in { DEMO_OWNER }&apos;s. Being let in is the same access
                            the <b>Permissions</b> menu grants, reached by asking instead of by being picked.
                        </p>
                    ) }
                </div>
            </div>
        </div>
    );
}
