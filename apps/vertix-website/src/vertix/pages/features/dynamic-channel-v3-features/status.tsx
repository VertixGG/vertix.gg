import React from "react";

import { DiscordModal, DiscordInput, DiscordFlowSimulator, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { varsReplaceTokens } from "@vertix.gg/base/src/utils/vars-utils";

import {
    DYNAMIC_CHANNEL_STATUS_VARS,
    VAR_DYNAMIC_CHANNEL_GAME,
    VAR_DYNAMIC_CHANNEL_STATE,
    VAR_DYNAMIC_CHANNEL_USER
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/**
 * What the three tokens a status may carry stand for, here.
 *
 * Only three of them, and the bot says which: a status is rewritten every time somebody joins or
 * leaves, so it may only carry what can change while people are sitting in the channel. The room's
 * game rather than the owner's, because a status is about what is happening in there - and the
 * state is public or private only, a hidden channel reading as private since that is what it is to
 * anybody who could not find it.
 */
const STATUS_TOKEN_VALUES: Readonly<Record<string, string>> = {
    [ VAR_DYNAMIC_CHANNEL_USER ]: DEMO_OWNER,
    [ VAR_DYNAMIC_CHANNEL_GAME ]: "Counter-Strike",
    [ VAR_DYNAMIC_CHANNEL_STATE ]: "🟢"
};

/**
 * Function statusOf() :: The line the channel would actually wear.
 *
 * The bot fills the tokens in on every write rather than once when the status was pinned, which is
 * the whole point of allowing them - a status reading `{game}` follows the room onto whatever it
 * plays next. What is shown back is therefore always the assembled line, never what was typed.
 */
function statusOf( typed: string ): string {
    return varsReplaceTokens( typed.trim(), STATUS_TOKEN_VALUES );
}

/**
 * Function StatusModal() :: The modal the bot opens, with a field somebody can actually type in.
 *
 * Hand written because modals are the one part of the interface the bot does not export - the
 * flows say a modal is what carries you to the next state, and stop there.
 */
function StatusModal( { onSubmit }: { onSubmit: ( values: Readonly<Record<string, string>> ) => void } ) {
    const [ status, setStatus ] = React.useState( "Ranked grind, need two" );

    return (
        <div className="flex justify-start">
            <DiscordModal
                title="Set dynamic channel status"
                cancelLabel="Cancel"
                showNotice={ true }
                onSubmit={ () => onSubmit( { status } ) }
            >
                <DiscordInput
                    label="WHAT IS HAPPENING IN YOUR CHANNEL"
                    value={ status }
                    style="short"
                    maxLength={ 128 }
                    onChange={ setStatus }
                />
            </DiscordModal>
        </div>
    );
}

export default function Status() {
    const channelMembers = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

    const channel = {
        name: DEMO_CHANNEL_NAME,
        active: true,
        userCount: 3,
        maxUsers: 5,
        timer: "26:08",
        users: channelMembers
    };

    const [ channelStatus, setChannelStatus ] = React.useState<string | null>( null );

    // Remounting the simulator is the reset: it owns where it stands in the flow, and there is no
    // half-way state worth preserving once somebody asks to start again.
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const handleReset = () => {
        setChannelStatus( null );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.status }
                        alt="Status"
                        fallback="📢"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Channel Status</h3>
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
                            <p className="mb-3"><strong>The status is the line Discord shows under your channel&apos;s name. Try it below — the panel is the real one.</strong></p>

                            { /* Plain prose, and nowhere near the Discord window - it is the page
                                 talking to the reader, not something Discord is showing them. */ }
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
                            channelName={ channel.name }
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        ...channel,
                                        // Unset, the row carries Discord's own invitation to set
                                        // one - which is the other half of what this feature is.
                                        status: channelStatus
                                            ? { text: channelStatus }
                                            : { text: "Set a channel status", editable: true }
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
                                        name: channel.name,
                                        limit: String( channel.maxUsers )
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelStatusButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 📢 Status )</b> — it is lit up for you</>,
                                        body: "This is your channel panel, the one the bot posts in your channel."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelStatusFlow/States/Default": {
                                        title: "Type what is happening, then submit",
                                        body: <>
                                            A status can carry <code>{ VAR_DYNAMIC_CHANNEL_GAME }</code> and fill
                                            itself in. Leave the field empty to hand the line back to the bot, or use
                                            the word <code>noob</code> to see a server&apos;s bad-word list refuse it.
                                        </>
                                    },
                                    Success: { title: "Your channel says it, until you change it" },
                                    Cleared: { title: "The bot has the line back, and keeps it up to date" },
                                    Badword: { title: "A word the server disallows never reaches the channel" }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelStatusFlow/States/Default": {
                                        render: ( submit ) => <StatusModal onSubmit={ submit }/>,
                                        // Only a status somebody actually set is carried forward. An
                                        // empty one is not a status the bot shows back - it hands the
                                        // line to the composed one the Cleared state declares, and
                                        // writing "" here would print that away as a pair of quotes.
                                        toVariables: ( values ): Readonly<Record<string, string>> => {
                                            const status = statusOf( values.status );

                                            return status ? { channelStatus: status } : {};
                                        },
                                        // The channel list has to agree with the message above it, so it
                                        // follows the transition the flow took rather than deciding for
                                        // itself - a status the bot refused never reaches the channel.
                                        onTransition: ( transitionName, values ) => {
                                            if ( "VertixBot/UI-V3/DynamicChannelStatusFlow/Transitions/SubmitSuccess" === transitionName ) {
                                                setChannelStatus( statusOf( values.status ) );
                                            } else if ( "VertixBot/UI-V3/DynamicChannelStatusFlow/Transitions/SubmitCleared" === transitionName ) {
                                                setChannelStatus( null );
                                            }
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    { /* The three are read off the bot's own list rather than named here, so a page
                         cannot go on offering a token the status stopped accepting. */ }
                    <div className="text-h5 text-vc-ice-dim">
                        <p className="mb-0">
                            A status can carry placeholders, and the bot fills them in again every time it
                            rewrites the line — so one reading <code>{ VAR_DYNAMIC_CHANNEL_GAME }</code> follows the
                            room onto whatever it plays next. Only{ " " }
                            { DYNAMIC_CHANNEL_STATUS_VARS.map( ( token, index ) => (
                                <React.Fragment key={ token }>
                                    { index > 0 && ( index === DYNAMIC_CHANNEL_STATUS_VARS.length - 1 ? " and " : ", " ) }
                                    <code>{ token }</code>
                                </React.Fragment>
                            ) ) }
                            { " " }work here, because a status may only carry what can change while people are
                            sitting in the channel.{ " " }
                            <a href="/posts/channel-name-placeholders">What each one means in full</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
