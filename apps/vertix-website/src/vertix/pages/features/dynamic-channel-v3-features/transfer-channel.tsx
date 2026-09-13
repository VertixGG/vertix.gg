import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

const FIRST_OWNER = DEMO_OWNER;

const MEMBERS = [ { ...DEMO_MEMBERS.owner, username: FIRST_OWNER }, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

/** Everybody in the room who could be handed the channel, which is everybody but its owner. */
const CANDIDATES = MEMBERS.filter( ( member ) => FIRST_OWNER !== member.username );

export default function TransferChannel() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /**
     * Who the channel belongs to.
     *
     * Nothing in Discord's own chrome says who owns a channel - no badge, no rename - so the thing
     * a transfer changes is what the panel will do for you. Once it is somebody else's, none of it
     * is yours to press, and that is the result worth showing.
     */
    const [ owner, setOwner ] = React.useState( FIRST_OWNER );

    // Who the menu picked, held until the confirmation asks for them by name.
    const [ selected, setSelected ] = React.useState( "" );

    const isOwner = FIRST_OWNER === owner;

    const handleReset = () => {
        setOwner( FIRST_OWNER );
        setSelected( "" );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.transferChannel }
                        alt="Transfer"
                        fallback="🔀"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Transfer Ownership</h3>
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
                                    Handing the channel to somebody else. It asks twice, because there is no undo —
                                    and once it is done, the panel is theirs and not yours.
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
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        name: DEMO_CHANNEL_NAME,
                                        active: true,
                                        timer: "26:08",
                                        users: MEMBERS
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
                                    mentionUser: owner,
                                    variables: {
                                        ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                        name: DEMO_CHANNEL_NAME
                                    }
                                } }
                                // Once the channel is somebody else's, the panel stops answering to
                                // you - which is the whole of what a transfer does.
                                allowedElements={ isOwner ? [ "VertixBot/UI-V3/DynamicChannelTransferOwnerButton" ] : [] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ FIRST_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 🔀 Transfer )</b> — it is lit up for you</>,
                                        body: "The channel is yours, so the panel answers to you."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/SelectUser": {
                                        title: "Pick who to hand it to",
                                        body: "Nothing happens yet — it asks you to confirm before it does anything."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/UserSelected": {
                                        title: "It warns you, then asks",
                                        body: <>
                                            <b>👍 Yes</b> gives the channel away for good. <b>👎 No</b> takes the whole
                                            exchange off the screen and leaves the channel where it is.
                                        </>
                                    },
                                    Success: {
                                        title: <>Done — the channel belongs to { selected || "somebody else" } now</>,
                                        body: <>
                                            Look at the panel above: nothing on it is lit any more. It is the same
                                            message in the same channel, but none of it is yours to press —
                                            only { selected || "the new owner" } can rename it, set its limit, or hand
                                            it on again.
                                        </>
                                    },
                                    DisabledByClaim: { title: "Not while a claim is under way" },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/SelectUser": {
                                        menus: {
                                            "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu": {
                                                options: CANDIDATES.map( ( member ) => ( {
                                                    label: member.username,
                                                    icon: member.avatar,
                                                    values: { userDisplayName: member.username }
                                                } ) )
                                            }
                                        },
                                        // The flow carries the name into the message that asks; the
                                        // page holds onto it for the answer, which is a press and
                                        // so says nothing about who it is for.
                                        onTransition: ( _name, values ) => setSelected( values.userDisplayName )
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/UserSelected": {
                                        highlight: [ "VertixBot/UI-General/YesButton" ],
                                        onTransition: ( transitionName ) => {
                                            if ( "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Confirm" === transitionName && selected ) {
                                                setOwner( selected );
                                            }
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <div className="text-h5 text-vc-ice-dim">
                        <p className="mb-0">
                            Ownership is the only thing that moves. The channel keeps its name, its settings and
                            everybody in it — including you, who can stay as long as the new owner allows.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
