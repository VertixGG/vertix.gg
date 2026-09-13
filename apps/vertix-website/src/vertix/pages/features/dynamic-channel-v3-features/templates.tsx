import React from "react";

import { DiscordFlowSimulator, DiscordFlowModal, DiscordAppFrame } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS, DEMO_OWNER, DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";
import { DynamicChannelV3Sidebar } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-sidebar";

const MAX_TEMPLATES = 5;

const UNLIMITED_LABEL = "Unlimited",
    AUTOMATIC_REGION = "Automatic";

/** Everything a template remembers, which is everything the other buttons set one at a time. */
interface ChannelConfig {
    name: string;
    limit: number;
    privacy: string;
    region: string;
}

interface Template {
    id: string;
    name: string;
    config: ChannelConfig;
}

const STARTING_CHANNEL: ChannelConfig = {
    name: DEMO_CHANNEL_NAME,
    limit: 0,
    privacy: "public",
    region: AUTOMATIC_REGION
};

const STARTING_TEMPLATES: ReadonlyArray<Template> = [
    {
        id: "gaming",
        name: "Gaming",
        config: { name: "🎮 Gaming Room", limit: 10, privacy: "public", region: AUTOMATIC_REGION }
    },
    {
        id: "study",
        name: "Study",
        config: { name: "📚 Study Room", limit: 4, privacy: "private", region: "Rotterdam" }
    }
];

const CHANNEL_MEMBERS = [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ];

/** What the "applied" message lists back, in the shape the bot's own preview declares. */
function appliedSettings( config: ChannelConfig ): string {
    return [
        `- **Name**: ${ config.name }`,
        `- **Limit**: ${ config.limit ? config.limit : UNLIMITED_LABEL }`,
        `- **Privacy**: ${ config.privacy }`,
        `- **Region**: ${ config.region }`
    ].join( "\n" );
}

export default function Templates() {
    const [ runKey, setRunKey ] = React.useState( 0 );

    const [ guidance, setGuidance ] = React.useState<{ title: React.ReactNode; body?: React.ReactNode } | null>( null );

    const [ templates, setTemplates ] = React.useState<ReadonlyArray<Template>>( STARTING_TEMPLATES );

    /**
     * The channel as it stands, which is both what a template captures and what applying one
     * changes. It is the same handful of settings the other buttons each change on their own -
     * templates are those settings remembered together.
     */
    const [ channel, setChannel ] = React.useState<ChannelConfig>( STARTING_CHANNEL );

    // Which template a menu picked, held until the confirm button asks for it.
    const [ selected, setSelected ] = React.useState<Template | null>( null );

    const handleReset = () => {
        setTemplates( STARTING_TEMPLATES );
        setChannel( STARTING_CHANNEL );
        setSelected( null );
        setRunKey( ( key ) => key + 1 );
    };

    const templateOptions = templates.map( ( item ) => ( {
        label: item.name,
        description: `${ item.config.name } · ${ item.config.limit ? item.config.limit : UNLIMITED_LABEL }`,
        values: { selectedTemplateId: item.id }
    } ) );

    const pickSelected = ( values: Readonly<Record<string, string>> ) => {
        setSelected( templates.find( ( item ) => item.id === values.selectedTemplateId ) ?? null );
    };

    /**
     * What the three template buttons do, wherever they are drawn.
     *
     * They sit on the state you start from and on each of the three that report what just happened,
     * so the answer to pressing one has to be the same in all four - the capture modal included, or
     * capturing from a result would save a template with no name.
     */
    const templateMenuStep = ( highlight: string ) => ( {
        highlight: [ highlight ],
        modals: {
            "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton": ( submit: ( values: Readonly<Record<string, string>> ) => void ) => (
                <DiscordFlowModal
                    modalName="VertixBot/UI-V3/DynamicChannelTemplatesSaveModal"
                    initialValues={ { "VertixBot/UI-V3/DynamicChannelTemplatesSaveInput": "Movie Night" } }
                    onSubmit={ ( values ) => submit( {
                        templateName: ( values[ "VertixBot/UI-V3/DynamicChannelTemplatesSaveInput" ] ?? "" ).trim()
                    } ) }
                />
            )
        },
        // Capturing remembers the channel as it stands, which is what the bot reads off it at the
        // moment the modal comes back.
        onTransition: ( _name: string | null, values: Readonly<Record<string, string>> ) => {
            if ( !values.templateName ) {
                return;
            }

            setTemplates( ( saved ) => [ ...saved, {
                id: `captured-${ saved.length }`,
                name: values.templateName,
                config: channel
            } ] );
        }
    } );

    return (
        <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center">
                    <DynamicChannelV3Emoji
                        name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.templates }
                        alt="Templates"
                        fallback="📂"
                        className="text-h2 mr-4"
                    />
                    <h3 className="mb-0">Channel Templates</h3>
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
                                    A template is your channel&apos;s settings remembered together — its name, its
                                    limit, its privacy, its region — so you can put all four back with one press. Try
                                    it below; the channel beside it follows whatever you apply.
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
                                        name: channel.name,
                                        active: true,
                                        locked: "private" === channel.privacy,
                                        userCount: CHANNEL_MEMBERS.length,
                                        maxUsers: channel.limit || undefined,
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
                                        templatesEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.templates,
                                        name: channel.name,
                                        limit: channel.limit ? String( channel.limit ) : UNLIMITED_LABEL,
                                        region: channel.region,
                                        /*
                                         * The templates themselves, which is all these messages
                                         * are told: how many there are, how many are allowed, the
                                         * list under the count and whether there is a list at all
                                         * are each the embed's own working out from this.
                                         */
                                        templates: JSON.stringify( templates ),
                                        maxTemplates: String( MAX_TEMPLATES )
                                    }
                                } }
                                allowedElements={ [ "VertixBot/UI-V3/DynamicChannelTemplatesButton" ] }
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                interactionUser={ DEMO_OWNER }
                                guidance={ {
                                    "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                                        title: <>Press <b>( 📂 Templates )</b> — it is lit up for you</>,
                                        body: "Two are saved already, so there is something to apply."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/Default": {
                                        title: "Three things you can do with a template",
                                        body: <>
                                            <b>Capture</b> remembers the channel as it is now, <b>Apply</b> puts a
                                            saved one back, <b>Delete</b> throws one away. Start
                                            with <b>Apply Template</b>.
                                        </>
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyMenu": {
                                        title: "Pick one from the menu",
                                        body: "Nothing happens yet — the bot asks you to confirm first."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyConfirm": {
                                        title: <>Now press <b>Apply Selected</b></>,
                                        body: "Watch the channel in the list: its name, its limit and its padlock all move at once."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateApplied": {
                                        title: "Four settings changed by one press",
                                        body: <>
                                            The message lists what it put back. Try <b>Capture Template</b> next to
                                            save the channel as it now stands.
                                        </>
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateSaved": {
                                        title: "Saved, and on the list",
                                        body: <>
                                            It captured the channel exactly as it is. <b>Delete</b> throws one away,
                                            if you want to see the last of the three.
                                        </>
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ManageMenu": {
                                        title: "Pick one to throw away",
                                        body: "This one cannot be undone, so it asks twice."
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/DeleteConfirm": {
                                        title: <>Press <b>Confirm Delete</b> to go through with it</>,
                                        body: <><b>◀ Back</b> leaves it where it is.</>
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateDeleted": {
                                        title: "Gone, and the count is down one",
                                        body: "The channel itself is untouched — a template is only a memory of one."
                                    }
                                } }
                                steps={ {
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/Default": templateMenuStep( "VertixBot/UI-V3/DynamicChannelTemplatesApplyButton" ),
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyMenu": {
                                        menus: { "VertixBot/UI-V3/DynamicChannelTemplatesApplySelectMenu": { options: templateOptions } },
                                        onTransition: ( _name, values ) => pickSelected( values )
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyConfirm": {
                                        highlight: [ "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmButton" ],
                                        menus: { "VertixBot/UI-V3/DynamicChannelTemplatesApplySelectMenu": { options: templateOptions } },
                                        toVariables: (): Readonly<Record<string, string>> => selected
                                            ? {
                                                templateName: selected.name,
                                                appliedSettings: appliedSettings( selected.config )
                                            }
                                            : {},
                                        // What the template remembered becomes what the channel is.
                                        onTransition: ( _name, values ) => {
                                            if ( values.selectedTemplateId ) {
                                                pickSelected( values );

                                                return;
                                            }

                                            if ( selected ) {
                                                setChannel( selected.config );
                                            }
                                        }
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ManageMenu": {
                                        menus: { "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu": { options: templateOptions } },
                                        onTransition: ( _name, values ) => pickSelected( values )
                                    },
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/DeleteConfirm": {
                                        highlight: [ "VertixBot/UI-V3/DynamicChannelTemplatesDeleteConfirmButton" ],
                                        menus: { "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu": { options: templateOptions } },
                                        toVariables: (): Readonly<Record<string, string>> =>
                                            selected ? { templateName: selected.name } : {},
                                        onTransition: ( _name, values ) => {
                                            if ( values.selectedTemplateId ) {
                                                pickSelected( values );

                                                return;
                                            }

                                            if ( selected ) {
                                                setTemplates( ( saved ) => saved.filter( ( item ) => item.id !== selected.id ) );
                                                setSelected( null );
                                            }
                                        }
                                    },
                                    // The three result states put the same three buttons back, so
                                    // they answer for them the same way - including the modal the
                                    // capture button opens.
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateSaved": templateMenuStep( "VertixBot/UI-V3/DynamicChannelTemplatesManageButton" ),
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateApplied": templateMenuStep( "VertixBot/UI-V3/DynamicChannelTemplatesCaptureButton" ),
                                    "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateDeleted": templateMenuStep( "VertixBot/UI-V3/DynamicChannelTemplatesApplyButton" )
                                } }
                            />
                        </DiscordAppFrame>
                    </div>
                </div>
            </div>
        </div>
    );
}
