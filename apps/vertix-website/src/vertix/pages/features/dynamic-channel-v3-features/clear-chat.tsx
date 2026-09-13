import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame, DiscordMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import {
    DEMO_CHANNEL_NAME,
    DEMO_MEMBERS,
    DEMO_OWNER,
    DYNAMIC_CHANNEL_V3_EMOJIS,
    DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES
} from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

interface ChannelMessage {
    id: string;
    author: string;
    avatar: string;
    time: string;
    text: string;
}

/**
 * The chatter sitting in the channel before anybody presses anything.
 *
 * Clearing only reads as clearing against something to clear, and against the one message it leaves
 * alone - the panel stays where it is while everything under it goes.
 */
const STARTING_MESSAGES: ReadonlyArray<ChannelMessage> = [
    {
        id: "1",
        author: DEMO_OWNER,
        avatar: DEMO_MEMBERS.owner.avatar,
        time: "Today at 11:54 AM",
        text: "anyone up for a round?"
    },
    {
        id: "2",
        author: "Alex",
        avatar: DEMO_MEMBERS.alex.avatar,
        time: "Today at 11:55 AM",
        text: "give me five minutes"
    },
    {
        id: "3",
        author: "Jordan",
        avatar: DEMO_MEMBERS.jordan.avatar,
        time: "Today at 11:56 AM",
        text: "same, putting the kettle on"
    },
    {
        id: "4",
        author: DEMO_OWNER,
        avatar: DEMO_MEMBERS.owner.avatar,
        time: "Today at 11:58 AM",
        text: "no rush"
    },
    {
        id: "5",
        author: "Alex",
        avatar: DEMO_MEMBERS.alex.avatar,
        time: "Today at 12:00 PM",
        text: "right, I'm in"
    }
];

export default function ClearChat() {
    const channelMembers = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

    const [ messages, setMessages ] = React.useState<ReadonlyArray<ChannelMessage>>( STARTING_MESSAGES );

    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const handleReset = () => {
        setMessages( STARTING_MESSAGES );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.clearChat }
                        alt="Clear Chat"
                        fallback="🧹"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Clear Chat</h3>
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
                                    Clear Chat wipes the ordinary messages out of your channel and leaves the panel
                                    alone. Try it below — the messages under the panel are the ones it takes.
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

                    <div className="mb-6">
                        <DiscordAppFrame
                            channelName={ DEMO_CHANNEL_NAME }
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        name: DEMO_CHANNEL_NAME,
                                        active: true,
                                        userCount: 3,
                                        maxUsers: 5,
                                        timer: "26:08",
                                        users: channelMembers
                                    } }
                                />
                            }
                        >
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
                                        limit: "5"
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelClearChatButton" ] }
                                // The messages the feature acts on, sitting in the channel under the
                                // panel - the page owns them, so it can take them away when the bot
                                // says they are gone.
                                channelMessages={ messages.map( ( message ) => (
                                    <DiscordMessage
                                        key={ message.id }
                                        author={ message.author }
                                        avatar={ message.avatar }
                                        timestamp={ message.time }
                                        app={ false }
                                    >
                                        { message.text }
                                    </DiscordMessage>
                                ) ) }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 🧹 Clear Chat )</b> — it is lit up for you</>,
                                        body: `There are ${ messages.length } messages in the channel right now — watch them go.`
                                    },
                                    Success: {
                                        title: "The channel is cleared, and the panel is left where it is",
                                        body: "Press it again to see what happens with nothing left to clear."
                                    },
                                    NothingToClear: { title: "Nothing to clear — the channel is already empty" },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    // Pressing it is the whole of the interaction - the bot goes
                                    // away, clears the channel and comes back with what happened -
                                    // so this resolves the moment it is reached, with what the bot
                                    // would have found. An empty count is how the embed tells the
                                    // two answers apart.
                                    "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Default": {
                                        values: () => ( {
                                            ownerDisplayName: DEMO_OWNER,
                                            totalMessages: messages.length ? String( messages.length ) : ""
                                        } ),
                                        toVariables: () => ( { clearEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.clearChat } ),
                                        onTransition: ( transitionName ) => {
                                            if ( "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearSuccess" === transitionName ) {
                                                setMessages( [] );
                                            }
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>
                </div>
            </div>
        </div>
    );
}
