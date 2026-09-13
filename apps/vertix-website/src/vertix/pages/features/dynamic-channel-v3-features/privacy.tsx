import React from "react";

import { DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/**
 * Who is trusted, which is what two of the three states turn on.
 *
 * Privacy decides what the setting *means* for everybody else; the trusted list is kept by the
 * Permissions feature next door, and is shown here so the three states read as different rather
 * than as three words.
 */
const TRUSTED = [ "Alex" ];

const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex ];

const NO_BLOCKED = "Currently there are no blocked users.\n";

export default function Privacy() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /**
     * Which state the channel is in, and what it reads as.
     *
     * The label is built from the menu's own option - its emoji and its label - rather than written
     * down here, so the three states are the bot's list in this too. It goes to the panel as well as
     * to the privacy message, because the bot works out `state` once and every embed drawing it gets
     * the same answer.
     */
    const [ privacy, setPrivacy ] = React.useState( { value: "public", label: "🌐 Public" } );

    const hidden = "hidden" === privacy.value;

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.privacy }
                        alt="Privacy"
                        fallback="🚫"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Privacy State</h3>
                </div>

                <button
                    type="button"
                    onClick={ () => {
                        setPrivacy( { value: "public", label: "🌐 Public" } );
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
                                    Privacy is one menu with three answers: who can see your channel, and who can get
                                    into it. Try it below — the channel list beside it is what somebody who is not
                                    trusted would be looking at.
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
                                    // Hidden takes the channel off the list for everyone who is not
                                    // trusted, which is the one state you can see rather than only
                                    // read about - so there is no row to hand over at all.
                                    channel={ hidden ? undefined : {
                                        name: DEMO_CHANNEL_NAME,
                                        active: true,
                                        // The padlock is Discord's way of saying not everyone can
                                        // connect, so it belongs to Private and to nothing else -
                                        // a public channel wears none.
                                        locked: "private" === privacy.value,
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
                                        privacyEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.privacy,
                                        state: privacy.label,
                                        allowedUsersDisplay: TRUSTED.map( ( name ) => `- <@${ name }>\n` ).join( "" ),
                                        blockedUsersDisplay: NO_BLOCKED
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelPrivacyButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 🚫 Privacy )</b> — it is lit up for you</>,
                                        body: "Your channel is public to begin with, which is how Discord hands it to you."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default": {
                                        title: "Pick a state from the menu",
                                        body: <>
                                            There are three, and the message rewrites itself in place each time — the
                                            bot edits the one reply rather than sending another.
                                        </>
                                    },
                                    Public: {
                                        title: "Public — anyone can see it and anyone can walk in",
                                        body: <>Try <b>🚫 Private</b> next.</>
                                    },
                                    Private: {
                                        title: "Private — still listed, but only trusted users get in",
                                        body: <>
                                            Everybody can see the channel and knock; <b>Alex</b> is trusted, so only
                                            Alex gets through. Now try <b>🙈 Hidden</b>.
                                        </>
                                    },
                                    Hidden: {
                                        title: "Hidden — it is gone from the list for everyone else",
                                        body: <>
                                            Look at the channel list: that is what somebody who is not trusted now
                                            sees. Trusted users still see it and can still join.
                                        </>
                                    }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default": {
                                        menus: {
                                            // No options here on purpose - the three states are the
                                            // bot's own, declared on the menu and exported with it,
                                            // so the page says what picking one means and nothing
                                            // about what there is to pick.
                                            "VertixBot/UI-V3/DynamicChannelPrivacyMenu": {
                                                valuesFromOption: ( option ) => ( {
                                                    privacyState: option.value ?? "",
                                                    state: `${ option.emoji ?? "" } ${ option.label ?? "" }`.trim()
                                                } )
                                            }
                                        },
                                        onTransition: ( _transitionName, values ) => {
                                            setPrivacy( { value: values.privacyState, label: values.state } );
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <div className="text-h5 text-vc-ice-dim">
                        <p className="mb-0">
                            <b>Blocked users</b> cannot join in any state, and trusted and blocked lists are
                            both kept in <b>Permissions</b>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
