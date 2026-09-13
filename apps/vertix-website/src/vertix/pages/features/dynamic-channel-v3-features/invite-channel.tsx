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

/** The server the invite names, so the message reads the way Discord writes it. */
const GUILD_NAME = "Vertix";

interface InvitableMember {
    id: string;
    name: string;
    avatar: string;
    dmsOpen: boolean;
    hasAccess: boolean;
}

/**
 * Three people, and three different answers.
 *
 * Alex takes the link, Jordan is let in without ever hearing about it, and Mia was already in - so
 * inviting her changes nothing. Being let in and being told are two separate things, and only the
 * telling can fail.
 */
const INVITABLE_MEMBERS: ReadonlyArray<InvitableMember> = [
    {
        id: "alex",
        name: "Alex",
        avatar: DEMO_MEMBERS.alex.avatar,
        dmsOpen: true,
        hasAccess: false
    },
    {
        id: "jordan",
        name: "Jordan",
        avatar: DEMO_MEMBERS.jordan.avatar,
        dmsOpen: false,
        hasAccess: false
    },
    {
        id: "mia",
        name: "Mia",
        avatar: DEMO_MEMBERS.mia.avatar,
        dmsOpen: true,
        hasAccess: true
    }
];

/** Who is in the channel to begin with: the owner, alone behind a padlock. */
const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner ];

export default function InviteChannel() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const [ invited, setInvited ] = React.useState<InvitableMember | null>( null );

    const handleReset = () => {
        setInvited( null );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.inviteChannel }
                        alt="Invite"
                        fallback="📨"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Invite to Channel</h3>
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
                                    An invite has two ends — you let somebody in, and they are told where to go. Both
                                    are below: your screen first, then theirs.
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

                    <p className="text-h5 text-vc-ice mb-2"><strong>Your screen</strong></p>

                    <div className="mb-6">
                        <DiscordAppFrame
                            channelName={ DEMO_CHANNEL_NAME }
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        name: DEMO_CHANNEL_NAME,
                                        active: true,
                                        locked: true,
                                        timer: "26:08",
                                        users: CHANNEL_MEMBERS
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
                                        inviteEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.inviteChannel,
                                        name: DEMO_CHANNEL_NAME,
                                        state: "🚫 Private"
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelInviteButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 📨 Invite )</b> — it is lit up for you</>,
                                        body: "The channel is private, so nobody gets in without being let in."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelInviteFlow/States/SelectUser": {
                                        title: "Pick who to let in",
                                        body: <>
                                            <b>Alex</b> has messages open, <b>Jordan</b> has them closed, and <b>Mia</b>
                                            { " " }can already get in. All three answer differently.
                                        </>
                                    },
                                    // The one outcome with two faces: the access landed either way,
                                    // and only the telling of it could fail.
                                    Sent: invited && ! invited.dmsOpen
                                        ? {
                                            title: <>{ invited.name } is in — but the link never reached them</>,
                                            body: <>
                                                Their messages are closed. The access is theirs either way, which is
                                                why the bot tells you to pass it on yourself. Press <b>( 📨 Invite )</b>
                                                { " " }again for somebody else.
                                            </>
                                        }
                                        : {
                                            title: <>{ invited?.name ?? "They" } can get in now, and knows where to go</>,
                                            body: <>
                                                Their side is below — that message is the bot writing to them, not to
                                                you. The question became the answer, so press <b>( 📨 Invite )</b> again
                                                to let somebody else in.
                                            </>
                                        },
                                    NothingChanged: {
                                        title: "Nothing to do — they could already get in",
                                        body: <>
                                            Inviting somebody twice is not an error, it just changes nothing. Press{ " " }
                                            <b>( 📨 Invite )</b> again to try another.
                                        </>
                                    },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelInviteFlow/States/SelectUser": {
                                        menus: {
                                            "VertixBot/UI-V3/DynamicChannelInviteUserMenu": {
                                                options: INVITABLE_MEMBERS.map( ( member ) => ( {
                                                    label: member.name,
                                                    description: member.hasAccess
                                                        ? "Already has access"
                                                        : member.dmsOpen ? "Messages open" : "Messages closed",
                                                    icon: member.avatar,
                                                    values: {
                                                        memberId: member.id,
                                                        invitedDisplayName: member.name,
                                                        alreadyHasAccess: member.hasAccess ? "yes" : "no",
                                                        isInviteDelivered: member.dmsOpen ? "true" : "false"
                                                    }
                                                } ) )
                                            }
                                        },
                                        toVariables: ( values ) => ( {
                                            invitedDisplayName: values.invitedDisplayName,
                                            isInviteDelivered: values.isInviteDelivered
                                        } ),
                                        // Only a delivered invite has a second screen to show.
                                        onTransition: ( transitionName, values ) => {
                                            setInvited(
                                                "VertixBot/UI-V3/DynamicChannelInviteFlow/Transitions/Sent" === transitionName
                                                    ? INVITABLE_MEMBERS.find( ( member ) => member.id === values.memberId ) ?? null
                                                    : null
                                            );
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>{ invited ? `${ invited.name }'s screen` : "Their screen" }</strong>
                        <span className="text-vc-ice-dim"> — direct messages from the bot</span>
                    </p>

                    <DiscordAppFrame>
                        <div className="discord-chat-container vc-frame-box m-0">
                            { invited && invited.dmsOpen && (
                                <DiscordMessage
                                    author="VoiceChannels"
                                    avatar={ VertixAvatar }
                                    timestamp="Today at 12:00 PM"
                                >
                                    📨 <strong>{ DEMO_OWNER }</strong> invited you to <strong>{ DEMO_CHANNEL_NAME }</strong> in <strong>{ GUILD_NAME }</strong>.
                                    <br />
                                    <span className="discord-mention-pill">#{ DEMO_CHANNEL_NAME }</span>
                                </DiscordMessage>
                            ) }

                            { invited && ! invited.dmsOpen && (
                                <p className="text-h5 text-vc-ice-dim m-0 p-4">
                                    { invited.name } keeps their direct messages closed, so nothing arrives here. They
                                    can still walk into the channel — being let in and being told about it are two
                                    different things, and only one of them can fail.
                                </p>
                            ) }

                            { ! invited && (
                                <p className="text-h5 text-vc-ice-dim m-0 p-4">
                                    Nothing yet. Invite somebody above and their side of it appears here.
                                </p>
                            ) }
                        </div>
                    </DiscordAppFrame>
                </div>
            </div>
        </div>
    );
}
