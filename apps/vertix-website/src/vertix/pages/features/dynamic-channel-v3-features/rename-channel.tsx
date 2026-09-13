import React from "react";

import { DiscordFlowSimulator, DiscordFlowModal, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { varsIndexAsAlpha, varsIndexAsRoman, varsReplaceTokens } from "@vertix.gg/base/src/utils/vars-utils";

import {
    VAR_DYNAMIC_CHANNEL_GAME,
    VAR_DYNAMIC_CHANNEL_GUILD_ID,
    VAR_DYNAMIC_CHANNEL_INDEX,
    VAR_DYNAMIC_CHANNEL_INDEX_ALPHA,
    VAR_DYNAMIC_CHANNEL_INDEX_ROMAN,
    VAR_DYNAMIC_CHANNEL_ROLE_HIGHEST,
    VAR_DYNAMIC_CHANNEL_ROLE_HOIST,
    VAR_DYNAMIC_CHANNEL_STATE,
    VAR_DYNAMIC_CHANNEL_USER,
    VAR_DYNAMIC_CHANNEL_USER_USERNAME
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

/** Where the demo channel comes in the list of channels its generator has made. */
const DEMO_CHANNEL_INDEX = 1;

/**
 * What each placeholder stands for, for the one person this page is about.
 *
 * The bot works these out from the guild the channel is in - who the owner is, what they are
 * playing, where the channel comes in the generator's list - and hands them to the same replacer
 * used here, so a name comes out below exactly as it would come out in Discord. Only the values
 * are the page's; which tokens exist, and what each is spelled, are the bot's own.
 */
const NAME_TOKEN_VALUES: Readonly<Record<string, string>> = {
    [ VAR_DYNAMIC_CHANNEL_USER ]: DEMO_OWNER,
    [ VAR_DYNAMIC_CHANNEL_USER_USERNAME ]: DEMO_OWNER.toLowerCase(),
    // A server sets its own pair of these, and 🟢 is the one a new one starts with. The channel
    // here is public, so this is the half of the pair it wears.
    [ VAR_DYNAMIC_CHANNEL_STATE ]: "🟢",
    [ VAR_DYNAMIC_CHANNEL_GAME ]: "Counter-Strike",
    [ VAR_DYNAMIC_CHANNEL_INDEX ]: String( DEMO_CHANNEL_INDEX ),
    [ VAR_DYNAMIC_CHANNEL_INDEX_ROMAN ]: varsIndexAsRoman( DEMO_CHANNEL_INDEX ),
    [ VAR_DYNAMIC_CHANNEL_INDEX_ALPHA ]: varsIndexAsAlpha( DEMO_CHANNEL_INDEX ),
    [ VAR_DYNAMIC_CHANNEL_GUILD_ID ]: "1120213539064385597",
    [ VAR_DYNAMIC_CHANNEL_ROLE_HIGHEST ]: "Moderator",
    [ VAR_DYNAMIC_CHANNEL_ROLE_HOIST ]: "Admin"
};

export default function RenameChannel() {
    const channelMembers = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

    const [ channelName, setChannelName ] = React.useState( DEMO_CHANNEL_NAME );

    // Discord counts renames against a clock the browser has no access to, so the demonstration
    // counts attempts and the flow's own condition decides when that is one too many.
    const attempts = React.useRef( 0 );

    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const handleReset = () => {
        attempts.current = 0;
        setChannelName( DEMO_CHANNEL_NAME );
        setRunKey( ( key ) => key + 1 );
    };

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.rename }
                        alt="Rename"
                        fallback="✏️"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Rename Channel</h3>
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
                                    Your channel is yours to name, and a name can be written to fill itself in. Try it
                                    below — the panel is the real one, and the name you choose lands in the channel
                                    list beside it.
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
                            channelName={ channelName }
                            sidebar={
                                <DynamicChannelV3Sidebar
                                    channel={ {
                                        name: channelName,
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
                                        name: channelName,
                                        limit: "5"
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelRenameButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( ✏️ Rename )</b> — it is lit up for you</>,
                                        body: "This is your channel panel, the one the bot posts in your channel."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Default": {
                                        title: "Type a new name, then submit",
                                        body: <>
                                            <code>{ VAR_DYNAMIC_CHANNEL_USER }</code> is already in there and will fill
                                            itself in. Empty the field to take the server&apos;s own template instead,
                                            use the word <code>noob</code> to see a server&apos;s bad-word list refuse
                                            it, or rename three times to run into Discord&apos;s own limit.
                                        </>
                                    },
                                    Success: { title: "The channel is renamed, in the list beside it too" },
                                    Badword: { title: "A word the server disallows never reaches the channel name" },
                                    RateLimited: {
                                        title: "Discord allows two renames every ten minutes",
                                        body: "The third waits, and the bot says how long for."
                                    }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelRenameFlow/States/Default": {
                                        render: ( submit, previewDefaultVars ) => (
                                            <DiscordFlowModal
                                                modalName="VertixBot/UI-V3/DynamicChannelRenameModal"
                                                initialValues={ {
                                                    "VertixBot/UI-V3/DynamicChannelRenameInput": `${ VAR_DYNAMIC_CHANNEL_USER }'s Study Room`
                                                } }
                                                // What an empty field offers is the server's own
                                                // name template, which the bot only knows once it
                                                // has a guild to ask - so the export carries none
                                                // and the adapter declares what a preview's is.
                                                placeholders={ {
                                                    "VertixBot/UI-V3/DynamicChannelRenameInput":
                                                        previewDefaultVars.defaultChannelName ?? ""
                                                } }
                                                onSubmit={ ( values ) => {
                                                    attempts.current += 1;

                                                    const typed = ( values[ "VertixBot/UI-V3/DynamicChannelRenameInput" ] ?? "" ).trim();

                                                    // Nothing typed hands the name back to the
                                                    // server's template, which is what the empty
                                                    // field was offering all along.
                                                    const template = typed.length
                                                        ? typed
                                                        : previewDefaultVars.defaultChannelName ?? "";

                                                    // The placeholders are filled in before Discord
                                                    // is asked for anything, so the name that is
                                                    // checked, refused or set is the assembled one
                                                    // and never the template that was typed.
                                                    submit( {
                                                        name: varsReplaceTokens( template, NAME_TOKEN_VALUES ),
                                                        attempt: String( attempts.current )
                                                    } );
                                                } }
                                            />
                                        ),
                                        toVariables: ( values ) => ( { channelName: values.name } ),
                                        // Only a rename the bot actually performed reaches the list.
                                        onTransition: ( transitionName, values ) => {
                                            if ( "VertixBot/UI-V3/DynamicChannelRenameFlow/Transitions/SubmitSuccess" === transitionName ) {
                                                setChannelName( values.name );
                                            }
                                        }
                                    }
                                } }
                            />
                        </DiscordAppFrame>
                    </div>

                    <div className="text-h5 text-vc-ice-dim">
                        <p className="mb-0">
                            A name can carry placeholders, and the field above fills them in the way the bot does —{ " " }
                            <code>{ VAR_DYNAMIC_CHANNEL_USER }</code> for whoever owns the channel,{ " " }
                            <code>{ VAR_DYNAMIC_CHANNEL_GAME }</code> for what they are playing,{ " " }
                            <code>{ VAR_DYNAMIC_CHANNEL_INDEX }</code> for where it comes in the list. A token the name
                            does not understand is left standing exactly as you typed it.{ " " }
                            <a href="/posts/channel-name-placeholders">What each one means in full</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
