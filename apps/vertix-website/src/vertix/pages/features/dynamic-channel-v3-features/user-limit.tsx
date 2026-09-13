import React from "react";

import { DiscordFlowSimulator, DiscordFlowModal, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/**
 * The word the panel prints where a channel has no limit.
 *
 * Every other message here is handed the number and picks its own word for it. The panel is the
 * exception: it decides the same thing, in a function that also reaches the guild's configuration
 * for its title and description - so the exporter runs it, watches it reach for something only the
 * bot has, and leaves it behind. Nothing carries it, so the panel is told the word instead.
 */
const UNLIMITED_LABEL = "Unlimited";

/** No limit at all, which is the channel Discord hands you and where this starts. */
const NO_LIMIT = 0;

export default function UserLimit() {
    const channelMembers = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

    const [ channelLimit, setChannelLimit ] = React.useState( NO_LIMIT );

    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const handleReset = () => {
        setChannelLimit( NO_LIMIT );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.limit }
                        alt="User Limit"
                        fallback="✋"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">User Limit</h3>
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
                                    The user limit is how many people Discord lets into your channel at once. Try it
                                    below — the panel keeps the limit in view, so you can watch it change.
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
                                        // The limit, where the connection timer would otherwise
                                        // sit: this is the one row on the site where what Discord
                                        // counts against is the thing being demonstrated.
                                        userCount: channelMembers.length,
                                        // Discord only badges a channel that has a limit to count against.
                                        maxUsers: channelLimit || undefined,
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
                                        limit: channelLimit ? String( channelLimit ) : UNLIMITED_LABEL
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelLimitMetaButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( ✋ Limit )</b> — it is lit up for you</>,
                                        body: `Your channel lets anyone in right now, which the panel reads as "${ UNLIMITED_LABEL }" - and the channel beside it carries no count at all.`
                                    },
                                    "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Default": {
                                        title: "Type how many people you will allow, then submit",
                                        body: <>
                                            Use <code>0</code> to take the limit off again, or something outside the
                                            range the field asks for to see the bot refuse it.
                                        </>
                                    },
                                    Success: {
                                        title: "The limit is set, and the channel counts against it",
                                        body: "The panel reads it back, and Discord turns anybody past that number away at the door."
                                    },
                                    InvalidInput: { title: "A limit Discord cannot hold never reaches the channel" },
                                    Error: { title: "Something went wrong on Discord's side" }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelLimitFlow/States/Default": {
                                        render: ( submit ) => (
                                            <DiscordFlowModal
                                                modalName="VertixBot/UI-V3/DynamicChannelLimitModal"
                                                initialValues={ { "VertixBot/UI-V3/DynamicChannelLimitInput": "4" } }
                                                onSubmit={ ( values ) => {
                                                    const typed = values[ "VertixBot/UI-V3/DynamicChannelLimitInput" ] ?? "";

                                                    // The number as typed, twice over: the flow's own
                                                    // condition judges `userLimitValue`, and the embed
                                                    // is handed `userLimit` and decides for itself
                                                    // whether that reads as a number or as a word.
                                                    submit( {
                                                        userLimitValue: typed,
                                                        userLimit: typed.trim()
                                                    } );
                                                } }
                                            />
                                        ),
                                        // Only a limit the bot actually set reaches the panel.
                                        onTransition: ( transitionName, values ) => {
                                            if ( "VertixBot/UI-V3/DynamicChannelLimitFlow/Transitions/SubmitSuccess" === transitionName ) {
                                                setChannelLimit( Number( values.userLimit ) );
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
