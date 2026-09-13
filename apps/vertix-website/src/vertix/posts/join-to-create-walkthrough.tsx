import * as React from "react";

import { DiscordAppFrame, DiscordChannelList, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.png";

import { useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import {
    DEMO_CHANNEL_NAME,
    DEMO_MEMBERS,
    DEMO_OWNER,
    DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES
} from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import type { DiscordChannelListItem } from "@vertix.gg/discord-ui";

/** What the one channel a server keeps is called here, spelled as Discord spells it in the list. */
const GENERATOR_NAME = "＋ New Channel";

/**
 * Where the walk has got to.
 *
 * Three of them because there are three things to see, and none of them is a thing the bot is
 * asked for: a generator sitting on its own, the room joining it hands back, and the list once
 * the last person has gone. The middle one is the whole feature; the other two are what it is
 * measured against.
 */
type Stage = "generator" | "created" | "gone";

const GUIDANCE: Record<Stage, { title: React.ReactNode; body: React.ReactNode }> = {
    generator: {
        title: <>Press <b>{ GENERATOR_NAME }</b> — the one channel the server keeps</>,
        body: <>
            Nobody ever talks in it - walking into it is the whole of what it is for. Jordan and
            Sam are below it in rooms it gave them earlier.
        </>
    },
    created: {
        title: <>A room was made for you, and you were moved into it</>,
        body: <>
            It is named after you and you are the only one in it. The generator is still sitting
            there for whoever walks in next, and the panel below belongs to you - no role to hand
            out, no command to learn.
        </>
    },
    gone: {
        title: "You left, so the room went with you",
        body: <>
            Yours is gone the moment it emptied. Jordan and Sam still have theirs, because they
            are still in them - and nobody has anything to tidy up.
        </>
    }
};

/**
 * The rooms other people are already sitting in, which the walk never touches.
 *
 * They are here so the generator is shown doing its job for a server rather than for one reader:
 * these two walked into it before you did, and yours appearing and disappearing leaves them
 * exactly where they are.
 */
const OTHER_MEMBERS_CHANNELS: DiscordChannelListItem[] = [
    {
        id: "jordan-channel",
        name: "🟢 Jordan's Channel",
        userCount: 3,
        maxUsers: 4,
        users: [ DEMO_MEMBERS.jordan, DEMO_MEMBERS.mia, DEMO_MEMBERS.alex ]
    },
    {
        id: "sam-channel",
        name: "🔴 Sam's Channel",
        locked: true,
        userCount: 1,
        maxUsers: 2,
        users: [ { id: "sam", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/4.png" } ]
    }
];

/**
 * The channels the server has, at this point in the walk.
 *
 * The generator never moves and is never removed, which is the point being made - what appears
 * below it is the only thing that changes.
 */
function getChannels( stage: Stage ): DiscordChannelListItem[] {
    const channels: DiscordChannelListItem[] = [ { id: "generator", name: GENERATOR_NAME } ];

    if ( "created" === stage ) {
        channels.push( {
            id: "dynamic-channel",
            // 🟢 is the mark a public channel wears, and a new one is public until its owner says
            // otherwise. No occupancy pair beside it: nobody has set a limit, so Discord has no
            // second number to show.
            name: `🟢 ${ DEMO_CHANNEL_NAME }`,
            active: true,
            timer: "00:03",
            users: [ DEMO_MEMBERS.owner ]
        } );
    }

    return [ ...channels, ...OTHER_MEMBERS_CHANNELS ];
}

/**
 * Join to Create, walked rather than described.
 *
 * The reader presses the generator themselves and watches the list answer, because the feature is
 * a sequence - join, get a room, leave, room gone - and a sequence shown as three screenshots is
 * three pictures the reader has to put in order on their own.
 */
export default function JoinToCreateWalkthrough() {
    const openFeature = useOpenDynamicChannelV3Feature(),
        [ stage, setStage ] = React.useState<Stage>( "generator" );

    const guidance = GUIDANCE[ stage ];

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="text-h5 text-vc-ice-dim">
                    <strong className="text-vc-ice">{ guidance.title }</strong> — { guidance.body }
                </div>
            </div>

            <DiscordAppFrame
                channelName={ "created" === stage ? DEMO_CHANNEL_NAME : undefined }
                sidebar={
                    <DiscordChannelList
                        title="Voice Channels"
                        channels={ getChannels( stage ) }
                        onChannelClick={ ( channel ) => {
                            if ( "generator" === channel.id ) {
                                setStage( "created" );
                            }
                        } }
                    />
                }
            >
                { "created" === stage ? (
                    <div className="discord-chat-container">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 12:00 PM"
                            mentionUsername={ DEMO_OWNER }
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                            onElementClick={ openFeature }
                        />
                    </div>
                ) : (
                    <p className="px-4 py-10 text-center text-vc-ice-dim mb-0">
                        { "generator" === stage
                            ? "Nothing here yet - the room does not exist until somebody joins."
                            : "The room was deleted the moment it emptied." }
                    </p>
                ) }
            </DiscordAppFrame>

            <div className="flex flex-wrap items-center gap-3 mt-4">
                { "created" === stage && (
                    <button
                        type="button"
                        onClick={ () => setStage( "gone" ) }
                        className="inline-flex items-center whitespace-nowrap rounded-md border border-white/15
                            bg-white/5 px-4 py-2 text-h5 transition-colors hover:bg-white/10"
                    >
                        Leave the channel
                    </button>
                ) }
            </div>
        </div>
    );
}
