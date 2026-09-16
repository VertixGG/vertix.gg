import React from "react";

import { DiscordFlowSimulator, DiscordFlowModal, DiscordAppFrame, DiscordChannelList, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import OwnerAvatar from "@vertix.gg/assets/brand/user-avatar.webp";
import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

import {
    DYNAMIC_CHANNEL_V3_BUTTON_ORDER,
    DYNAMIC_CHANNEL_V3_EMOJI_NAMES
} from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import {
    DEMO_CHANNEL_NAME,
    DEMO_MEMBERS,
    DEMO_OWNER,
    DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES
} from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/** Where the two demonstration posts go, as an admin would have named them. */
const LFM_CHANNELS = [
    { label: "looking-for-members", description: "Everyone · the server's board", id: "lfm-general" },
    { label: "ranked-lfm", description: "Ranked players only", id: "lfm-ranked" }
];

const EXAMPLE_NOTE = "Need 2 for ranked, mic required";

/** A room with a seat or two left in it, which is the only kind worth advertising. */
const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex ];

export default function Lfm() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /** Where the post went, once it has gone somewhere - the closing screen names it. */
    const [ destination, setDestination ] = React.useState<string | null>( null );

    /** Which channel is being looked at: the voice one it was raised from, or a board. */
    const [ viewing, setViewing ] = React.useState<string | null>( null );

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.lfm }
                        alt="LFM"
                        fallback="🔎"
                        className="text-h2 mr-4"
                    />
                    <h2 className="text-h3 mb-0">Looking for Members</h2>
                </div>

                <button
                    type="button"
                    onClick={ () => {
                        setDestination( null );
                        setViewing( null );
                        setRunKey( ( key ) => key + 1 );
                    } }
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
                                    A channel with room left in it can put itself on the server&apos;s board. The post
                                    says who is hosting, what they are playing and how many are in — and it takes
                                    itself down when the room fills up or empties.
                                </strong>
                            </p>

                            <p className="mb-3">
                                It is the one button a generator does not start with: there is nowhere to post until an
                                admin picks a channel for it, so an admin switches it on in the setup screen along with
                                the channels the posts may go to.
                            </p>

                            { viewing ? (
                                <p className="mb-0">
                                    <strong className="text-vc-ice">
                                        { viewing === destination
                                            ? <>This is what everyone else sees</>
                                            : <>Not this one</> }
                                    </strong>
                                    { " — " }
                                    { viewing === destination
                                        ? "the room, who is hosting, what they are playing and how many are in. Go back to the voice channel to raise another."
                                        : "the post went to the board its owner picked. Open that one instead." }
                                </p>
                            ) : guidance && (
                                <p className="mb-0">
                                    <strong className="text-vc-ice">{ guidance.title }</strong>
                                    { guidance.body && <> — { guidance.body }</> }
                                </p>
                            ) }
                        </div>
                    </div>

                    <div className="mb-6">
                        <DiscordAppFrame
                            channelName={ viewing ?? DEMO_CHANNEL_NAME }
                            // A board is an ordinary text channel, which wears a hash rather than
                            // the speaker a generator's channel does.
                            channelKind={ viewing ? "text" : "voice" }
                            // The note modal is drawn over this frame rather than over the page,
                            // and the frame is only as tall as what is in it - which here is one
                            // menu. Left to itself it came out shorter than the modal and cut the
                            // buttons off the bottom of it.
                            className="min-h-[620px]"
                            sidebar={
                                <>
                                    <DynamicChannelV3Sidebar
                                        channel={ {
                                            name: DEMO_CHANNEL_NAME,
                                            active: ! viewing,
                                            timer: "26:08",
                                            users: CHANNEL_MEMBERS
                                        } }
                                    />
                                    {
                                        /*
                                         * The boards, which are ordinary text channels somebody
                                         * else is reading. They are here from the start rather than
                                         * appearing with the post: the whole point of the feature is
                                         * that the room is advertised somewhere it is not.
                                         */
                                    }
                                    <DiscordChannelList
                                        title="Text Channels"
                                        collapsible={ true }
                                        channels={ LFM_CHANNELS.map( ( channel ) => ( {
                                            id: channel.id,
                                            name: channel.label,
                                            kind: "text" as const,
                                            active: viewing === channel.label,
                                            // Once the post is up, the board it went to is the next
                                            // thing to open - so it is ringed the way the button was.
                                            highlighted: ! viewing && destination === channel.label
                                        } ) ) }
                                        onChannelClick={ ( channel ) => setViewing( channel.name ) }
                                    />
                                </>
                            }
                        >
                            { viewing ? (
                                /*
                                 * A board, as somebody who is not in the room sees it. The post is
                                 * the v2 component: there is one of it, raised by either interface,
                                 * because what is being advertised is the room rather than the panel.
                                 */
                                <div className="discord-chat-container vc-frame-box m-0">
                                    { viewing === destination ? (
                                        <DiscordUIComponentMessage
                                            author="VoiceChannels"
                                            avatar={ VertixAvatar }
                                            timestamp="Today at 12:01 PM"
                                            componentName="VertixBot/UI-V2/DynamicChannelLfmPostComponent"
                                            variables={ {
                                                channelId: DEMO_CHANNEL_NAME,
                                                channelName: DEMO_CHANNEL_NAME,
                                                ownerId: DEMO_OWNER,
                                                ownerAvatarUrl: OwnerAvatar,
                                                occupancy: "●●○○  2/4",
                                                gameName: "Valorant",
                                                note: EXAMPLE_NOTE,
                                                noteLine: "{noteKnown}",
                                                gameLine: "{gameKnown}",
                                                elapsedTimeFormatFraction: "30.0 minutes"
                                            } }
                                            hideElements={ true }
                                        />
                                    ) : (
                                        <p className="text-h5 text-vc-ice-dim m-0 p-4">
                                            Nothing here. The post went to <b>#{ destination }</b> — a room is
                                            advertised on the one board its owner picked, not on all of them.
                                        </p>
                                    ) }
                                </div>
                            ) : (
                                /*
                                 * Opened on the panel, the way every other feature here is: the
                                 * button is the thing being explained, so it is the thing to press.
                                 */
                                <DiscordFlowSimulator
                                    key={ runKey }
                                    onGuidance={ setGuidance }
                                    entry={ {
                                        flowName: "VertixBot/UI-V3/DynamicChannelFlow",
                                        stateKey: "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
                                        componentName: "VertixBot/UI-V3/DynamicChannel",
                                        mentionUser: DEMO_OWNER,
                                        variables: {
                                            ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                            name: DEMO_CHANNEL_NAME,
                                            limit: "4",
                                            memberCount: String( CHANNEL_MEMBERS.length ),
                                            dynamicChannelButtonsTemplate: DYNAMIC_CHANNEL_V3_BUTTON_ORDER.join( "," ),
                                            dynamicChannelButtonsRowBreaks: "",
                                            // Stands in until a board is picked, so the closing
                                            // screen names one either way - a server with a single
                                            // board is never asked, and lands on exactly this.
                                            lfmChannelId: LFM_CHANNELS[ 0 ].label
                                        }
                                    } }
                                    allowedElements={ [ "VertixBot/UI-V3/DynamicChannelLfmButton" ] }
                                    author="VoiceChannels"
                                    avatar={ VertixAvatar }
                                    interactionUser={ DEMO_OWNER }
                                    guidance={ {
                                        "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                            title: <>Press <b>( 🔎 LFM )</b> — it is lit up for you</>,
                                            body: "Two of you, room for four. The note comes first, then it goes up."
                                        },
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/Default": {
                                            title: "Say who you are looking for",
                                            body: <>
                                                One line, and it can be left empty. It is the only part of the post you
                                                write — the rest the bot reads off the channel itself.
                                            </>
                                        },
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/SelectChannel": {
                                            title: "Pick the board it goes on",
                                            body: <>
                                                Only the channels you can see are offered. A server with one board never
                                                asks — the post goes straight up.
                                            </>
                                        },
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/Posted": {
                                            title: <>
                                                It is up — open { destination ? <b>#{ destination }</b> : "the board" } on
                                                the left to see it
                                            </>,
                                            body: "That screen is yours alone; the post is a message in a channel other people are reading. Nobody has to take it down either - it goes when the room fills up or empties."
                                        },
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/Cooldown": {
                                            title: "The board has had a post recently",
                                            body: "The limit belongs to the generator rather than to you, so somebody else's post can be the one in the way."
                                        },
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/Unavailable": {
                                            title: "Nothing to post",
                                            body: "A hidden or private room advertises nothing anyone could act on, and a full one has nothing to offer."
                                        }
                                    } }
                                    steps={ {
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/Default": {
                                        // Declared here as well as on the state that asks, because
                                        // the menu is drawn by the message this state opened and
                                        // goes on being drawn by it after the note is in.
                                            menus: {
                                                "VertixBot/UI-V3/DynamicChannelLfmChannelMenu": {
                                                    options: LFM_CHANNELS.map( ( channel ) => ( {
                                                        label: channel.label,
                                                        description: channel.description,
                                                        values: { lfmChannelId: channel.label }
                                                    } ) )
                                                }
                                            },
                                            render: ( submit ) => (
                                                <DiscordFlowModal
                                                    modalName="VertixBot/UI-V3/DynamicChannelLfmNoteModal"
                                                    initialValues={ {
                                                        "VertixBot/UI-V3/DynamicChannelLfmNoteInput": EXAMPLE_NOTE
                                                    } }
                                                    onSubmit={ ( values ) => {
                                                        submit( {
                                                            note: ( values[ "VertixBot/UI-V3/DynamicChannelLfmNoteInput" ] ?? "" ).trim(),
                                                            // This server has two boards, so it is
                                                            // asked which. One and it would never be.
                                                            destinations: LFM_CHANNELS.length > 1 ? "many" : "one"
                                                        } );
                                                    } }
                                                />
                                            )
                                        },
                                        "VertixBot/UI-V3/DynamicChannelLfmFlow/States/SelectChannel": {
                                            menus: {
                                                "VertixBot/UI-V3/DynamicChannelLfmChannelMenu": {
                                                    options: LFM_CHANNELS.map( ( channel ) => ( {
                                                        label: channel.label,
                                                        description: channel.description,
                                                        values: { lfmChannelId: channel.label }
                                                    } ) )
                                                }
                                            },
                                            onTransition: ( _transitionName, values ) => {
                                                setDestination( values.lfmChannelId ?? null );
                                            }
                                        }
                                    } }
                                />
                            ) }
                        </DiscordAppFrame>
                    </div>

                    <p className="text-h5 text-vc-ice-dim mb-0">
                        The post is the same message whichever interface raised it — a v2 channel and a v3 channel put
                        up the identical advert, because what is being advertised is the room rather than the panel.
                    </p>
                </div>
            </div>
        </div>
    );
}
