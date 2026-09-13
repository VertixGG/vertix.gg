import React from "react";

import { DiscordFlowSimulator, DiscordFlowModal, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex ];

const STARTING_TITLE = DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES.title,
    STARTING_DESCRIPTION = DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES.description;

/**
 * What the modals open with, so pressing submit is enough to see the panel change.
 *
 * The message a channel is handed comes out rather formal; these are what somebody would plausibly
 * put in its place, and having them already typed keeps the demonstration to two presses instead of
 * asking a reader to think of a channel description on the spot.
 */
const SUGGESTED_TITLE = "Welcome to my channel",
    SUGGESTED_DESCRIPTION =
        "Make yourself at home — rename the room, set how many people can join, " +
        "or keep it to the people you trust. The buttons below do all of it.\n\n" +
        "When the last person leaves, the channel tidies itself away.";

export default function PrimaryMessageEdit() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    /**
     * The panel's own words.
     *
     * This is the one feature whose result is the thing you started from: the primary message being
     * edited is the panel at the top, so a title that changes changes it up there, in front of you.
     */
    const [ title, setTitle ] = React.useState( STARTING_TITLE );

    const [ description, setDescription ] = React.useState( STARTING_DESCRIPTION );

    const titleChanged = STARTING_TITLE !== title,
        descriptionChanged = STARTING_DESCRIPTION !== description;

    const handleReset = () => {
        setTitle( STARTING_TITLE );
        setDescription( STARTING_DESCRIPTION );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.editPrimaryMessage }
                        alt="Edit Primary Message"
                        fallback="📝"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Edit Primary Message</h3>
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
                                    The primary message is the panel itself — the one the bot posts in every channel
                                    you open. This walks you through changing what it says, a step at a time, and the
                                    panel above rewrites itself as you go.
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
                                        editPrimaryMessageEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.editPrimaryMessage,
                                        title,
                                        description
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": titleChanged || descriptionChanged
                                        ? {
                                            title: "Done — the wizard closed itself and took its messages with it",
                                            body: <>
                                                What is left is the channel, and the panel now reads the way you wrote
                                                it. Press <b>( 📝 Edit Primary Message )</b> again to go round once more.
                                            </>
                                        }
                                        : {
                                            title: <>Press <b>( 📝 Edit Primary Message )</b> — it is lit up for you</>,
                                            body: "Everything above is the message you are about to edit."
                                        },
                                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm": titleChanged || descriptionChanged
                                        ? {
                                            title: "Back where you started, with the panel changed",
                                            body: "Look at the message at the top — that is what everybody in the channel now sees."
                                        }
                                        : {
                                            title: <>The bot reads the message back and asks before touching it</>,
                                            body: <>Press <b>👍 Yes</b> to go on, or <b>👎 No</b> to leave it alone.</>
                                        },
                                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditTitle": titleChanged
                                        ? {
                                            title: "The title is changed, here and in the panel above",
                                            body: <>Press <b>Next ▶</b> to go on to the description.</>
                                        }
                                        : {
                                            title: "Step one of two: the title",
                                            body: <>
                                                Press <b>Edit ✏️</b> — a new title is already typed in, so submitting
                                                is enough. <b>◀ Back</b> leaves the wizard, <b>Next ▶</b> moves on
                                                without changing anything.
                                            </>
                                        },
                                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription": descriptionChanged
                                        ? {
                                            title: "The description is changed too",
                                            body: <>Press <b>✔ Finish</b> to close the wizard.</>
                                        }
                                        : {
                                            title: "Step two of two: the description",
                                            body: <>
                                                The same again — <b>Edit ✏️</b> comes up with one written for you, or
                                                <b> ◀ Back</b> goes back to the title.
                                            </>
                                        }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/Confirm": { highlight: [ "VertixBot/UI-General/YesButton" ] },
                                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditTitle": {
                                        highlight: titleChanged ? [ "VertixBot/UI-General/WizardNextButton" ] : [ "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton" ],
                                        modals: {
                                            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton": ( submit ) => (
                                                <DiscordFlowModal
                                                    modalName="VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleModal"
                                                    initialValues={ {
                                                        "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalTitle": titleChanged ? title : SUGGESTED_TITLE
                                                    } }
                                                    onSubmit={ ( values ) => submit( {
                                                        title: ( values[ "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalTitle" ] ?? "" ).trim()
                                                    } ) }
                                                />
                                            )
                                        },
                                        // Only a title the bot actually wrote down reaches the panel.
                                        onTransition: ( _transitionName, values ) => {
                                            if ( values.title ) {
                                                setTitle( values.title );
                                            }
                                        }
                                    },
                                    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditFlow/States/EditDescription": {
                                        highlight: descriptionChanged ? [ "VertixBot/UI-General/WizardFinishButton" ] : [ "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton" ],
                                        modals: {
                                            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton": ( submit ) => (
                                                <DiscordFlowModal
                                                    modalName="VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionModal"
                                                    initialValues={ {
                                                        "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalDescription": descriptionChanged
                                                            ? description
                                                            : SUGGESTED_DESCRIPTION
                                                    } }
                                                    onSubmit={ ( values ) => submit( {
                                                        description: ( values[ "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalDescription" ] ?? "" ).trim()
                                                    } ) }
                                                />
                                            )
                                        },
                                        onTransition: ( _transitionName, values ) => {
                                            if ( values.description ) {
                                                setDescription( values.description );
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
