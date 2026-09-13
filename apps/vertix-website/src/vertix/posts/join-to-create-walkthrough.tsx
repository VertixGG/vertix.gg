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
type Stage = "generator" | "created" | "gone" | "moved";

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
    moved: {
        title: "You moved again, and nothing followed you",
        body: <>
            Hopping between rooms costs nothing, because none of them are yours to leave behind.
            Each panel belongs to whoever the room was made for. The generator is still up there
            whenever you want one of your own.
        </>
    },
    gone: {
        title: "You walked into somebody else's, so yours went",
        body: <>
            The room emptied and was deleted on the spot. The panel here is theirs, not yours -
            same buttons, and only the person it was made for can press them. Walk back into the
            generator for one of your own.
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
const SAM = { id: "sam", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/4.png" };

/**
 * Each of these carries who owns it, because walking into one means reading their panel rather
 * than yours - the room's settings are on it, and the line about only the owner being able to
 * change them is suddenly about somebody else.
 */
const OTHER_MEMBERS_CHANNELS: ( DiscordChannelListItem & { owner: string, plainName: string } )[] = [
    {
        id: "jordan-channel",
        name: "🟢 Jordan's Channel",
        plainName: "Jordan's Channel",
        owner: DEMO_MEMBERS.jordan.username,
        userCount: 3,
        maxUsers: 4,
        users: [ DEMO_MEMBERS.jordan, DEMO_MEMBERS.mia, DEMO_MEMBERS.alex ]
    },
    {
        id: "sam-channel",
        name: "🔴 Sam's Channel",
        plainName: "Sam's Channel",
        owner: SAM.username,
        locked: true,
        userCount: 1,
        maxUsers: 2,
        users: [ SAM ]
    }
];

function getJoinedChannel( joined: string | null ) {
    return OTHER_MEMBERS_CHANNELS.find( ( channel ) => channel.id === joined ) ?? null;
}

/**
 * The channels the server has, at this point in the walk.
 *
 * The generator never moves and is never removed, which is the point being made - what appears
 * below it is the only thing that changes.
 */
function getChannels( stage: Stage, joined: string | null ): DiscordChannelListItem[] {
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

    // You are wherever you walked to, so the room you joined gains you and its count moves with
    // it. A list that deleted your room without putting you anywhere would be showing a leave
    // that never landed.
    const others = OTHER_MEMBERS_CHANNELS.map( ( channel ) => (
        channel.id === joined
            ? {
                ...channel,
                active: true,
                userCount: ( channel.userCount ?? 0 ) + 1,
                users: [ ...( channel.users ?? [] ), DEMO_MEMBERS.owner ]
            }
            : channel
    ) );

    return [ ...channels, ...others ];
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
        [ stage, setStage ] = React.useState<Stage>( "generator" ),
        [ joined, setJoined ] = React.useState<string | null>( null );

    const joinedChannel = getJoinedChannel( joined );

    const guidance = GUIDANCE[ stage ];

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="text-h5 text-vc-ice-dim">
                    <strong className="text-vc-ice">{ guidance.title }</strong> — { guidance.body }
                </div>
            </div>

            <DiscordAppFrame
                channelName={ "created" === stage ? DEMO_CHANNEL_NAME : joinedChannel?.plainName }
                sidebar={
                    <DiscordChannelList
                        title="Voice Channels"
                        channels={ getChannels( stage, joined ) }
                        onChannelClick={ ( channel ) => {
                            if ( "generator" === channel.id ) {
                                setJoined( null );
                                setStage( "created" );
                                return;
                            }

                            // Nothing to walk out of yet - the guidance is asking for the
                            // generator, and the rooms below it are somebody else's business.
                            if ( "generator" === stage ) {
                                return;
                            }

                            // Walking into somebody else's room is leaving your own, and an empty
                            // room is deleted - so the way out of the walk is the same gesture
                            // that started it, rather than a button that only exists on a page.
                            // Doing it again is only a move: yours went the first time.
                            setJoined( channel.id );
                            setStage( "created" === stage ? "gone" : "moved" );
                        } }
                    />
                }
            >
                { "created" === stage && (
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
                ) }

                { joinedChannel && "created" !== stage && (
                    <div className="discord-chat-container">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 11:41 AM"
                            mentionUsername={ joinedChannel.owner }
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            variables={ {
                                ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                name: joinedChannel.plainName,
                                limit: String( joinedChannel.maxUsers ?? "Unlimited" ),
                                state: joinedChannel.locked ? "🔒 Private" : "🌐 Public"
                            } }
                        />
                    </div>
                ) }

                { "generator" === stage && (
                    <p className="px-4 py-10 text-center text-vc-ice-dim mb-0">
                        Nothing here yet - the room does not exist until somebody joins.
                    </p>
                ) }
            </DiscordAppFrame>

        </div>
    );
}
