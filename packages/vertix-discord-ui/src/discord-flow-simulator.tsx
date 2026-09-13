import React from "react";

import { DiscordUIComponentMessage } from "./discord-ui-component-message";

import {
    applyPreviewMutations,
    getUIFlowByName,
    resolveFlowChoices,
    resolveSubmittedTransition,
    stateShortName
} from "./ui-flows";

import { getUIComponentByName, isUISelectElementType } from "./ui-definitions";

import type { UIFlow, UIFlowChoice, UIFlowState } from "./ui-flows";
import type { UIComponent, UISelectMenuDefinition, UISelectOptionDefinition } from "./ui-definitions";
import type { DiscordMessageReply } from "./discord-message";
import type { UIElementOverride } from "./discord-ui-component-renderer";

/**
 * What the bot puts between an element's name and the one thing that copy of it is for.
 *
 * A vote message carries a button per candidate, and each is registered under the button's own
 * name with the candidate's id after it - which is also how the handler reads back who was voted
 * for. Pressing one here is read the same way.
 */
const ELEMENT_INSTANCE_SEPARATOR = ":";

export interface DiscordFlowSimulatorPosition {
    flowName: string;
    stateKey: string;
}

export interface DiscordFlowSimulatorGuidance {
    /** What to tell somebody standing here. */
    title: React.ReactNode;
    body?: React.ReactNode;
}

/** One thing that can be picked out of a menu, and what the bot would find if it were. */
export interface DiscordFlowSimulatorMenuOption {
    label: string;
    description?: string;
    icon?: string;
    /**
     * What the bot would have learned about this choice - whether they are staff, whether they are
     * already on the list. The flow's own conditions are asked of it, so the page states facts and
     * the bot's definitions decide what they mean.
     */
    values?: Readonly<Record<string, string>>;
}

export interface DiscordFlowSimulatorMenu {
    /**
     * What the menu offers, where the page is the one that knows - a menu over the people in a
     * room. Left out, the options the bot declared on the menu itself are used instead, and
     * `valuesFromOption` says what picking one means.
     */
    options?: ReadonlyArray<DiscordFlowSimulatorMenuOption>;
    /** What the bot would have been told, for an option that came from its own definition. */
    valuesFromOption?: ( option: UISelectOptionDefinition ) => Readonly<Record<string, string>>;
}

/** One of the copies of an element the bot builds one of per something. */
export interface DiscordFlowSimulatorElementInstance {
    /** What tells this copy from the others, as the bot's own id does - whom the vote is for. */
    key: string;
    /** What this copy's own wording is written against. */
    variables?: Readonly<Record<string, string>>;
}

export interface DiscordFlowSimulatorStep {
    /**
     * Rendered while this state is waiting on something to be filled in.
     *
     * Handed the state's own preview defaults alongside the submit, because a modal's fields are
     * exported without the parts of them that only exist once a guild is behind them - the hint in
     * an empty field is that guild's name template - and the adapter declares what those would be.
     *
     * Left out for a state nothing has to be filled in for - a button that just does the thing -
     * which resolves the moment it is reached, exactly as the bot's handler does.
     */
    render?: (
        submit: ( values: Readonly<Record<string, string>> ) => void,
        previewDefaultVars: Readonly<Record<string, string>>
    ) => React.ReactNode;
    /**
     * What the bot would have found, for a step with nothing to fill in.
     *
     * Told which element brought somebody here, for the states several of them lead to. The bot
     * answers one press of a claim message with "you are in the running" and another with "you
     * already are" out of the same handler, and which it is depends on which button was used.
     */
    values?: ( triggeredBy?: string, instanceKey?: string ) => Readonly<Record<string, string>>;
    /**
     * What can be picked from this state's menus, keyed by the menu's element name.
     *
     * A menu with nothing here is drawn but inert, so a panel offering five of them can be opened
     * up one at a time - or all at once, which is how the bot offers them.
     */
    menus?: Readonly<Record<string, DiscordFlowSimulatorMenu>>;
    /**
     * The modal a particular element opens, keyed by that element's name.
     *
     * Pressing it puts the modal up rather than walking the flow on; what the flow does happens
     * when the modal comes back, which is what the bot does with a button bound to one.
     */
    modals?: Readonly<Record<string, ( submit: ( values: Readonly<Record<string, string>> ) => void ) => React.ReactNode>>;
    /**
     * What a particular button submits when pressed, keyed by that button's name.
     *
     * Most buttons carry nothing - they only move you - but some are the answer themselves: yes and
     * no out of one state, to one state, are told apart by which was pressed and by what it says.
     */
    buttons?: Readonly<Record<string, () => Readonly<Record<string, string>>>>;
    /**
     * The copies of an element the bot draws one of per something, keyed by the element's name.
     *
     * A vote message carries a button for every candidate, built when it is drawn out of the one
     * button the component declares - so the export has the button and only the page has the
     * candidates. Pressing one says which it was, the way reading the bot's own id does.
     */
    elements?: Readonly<Record<string, ReadonlyArray<DiscordFlowSimulatorElementInstance>>>;
    /** Elements to light up here, for a step that wants to point at one thing at a time. */
    highlight?: ReadonlyArray<string>;
    /** Values to carry into the outcome, so it shows back what was actually typed. */
    toVariables?: ( values: Readonly<Record<string, string>> ) => Readonly<Record<string, string>>;
    /** Told which transition was taken, for anything on the page that has to agree with it. */
    onTransition?: ( transitionName: string | null, values: Readonly<Record<string, string>> ) => void;
}

export interface DiscordFlowSimulatorProps {
    /**
     * Told what to say about where the flow now stands, so the page can put it above the window
     * rather than inside it - instructions printed inside a Discord frame stop it looking like one.
     */
    onGuidance?: ( guidance: DiscordFlowSimulatorGuidance | null ) => void;
    entry: DiscordFlowSimulatorPosition & {
        /** The surface a person starts on. Entry states carry no component of their own. */
        componentName: string;
        /**
         * Who the message is addressed to, mentioned above it as Discord shows a ping.
         *
         * The bot posts a channel's panel at whoever owns it, so the owner's name stands at the
         * top of it - which also says, to anybody else reading, whose channel this is.
         */
        mentionUser?: string;
        /**
         * What is true of the channel right now, for every message the bot draws.
         *
         * The bot builds one bag of arguments per reply and lets whichever embed is rendering take
         * what it needs from it, so these reach the panel, any panel the flow opens, and whatever
         * the bot answers with - not only the message somebody started on.
         */
        variables?: Readonly<Record<string, string>>;
    };
    /**
     * Where the flow already stands when the demonstration begins, if not on the entry message.
     *
     * Some messages arrive rather than being opened: a request to be let in lands in the channel
     * the panel is posted in, under it. The entry is still what is drawn at the top - the channel
     * as it was - and this is what is going on beneath it.
     */
    opensAt?: DiscordFlowSimulatorPosition;
    /** Keyed by state key or its short name. */
    guidance?: Readonly<Record<string, DiscordFlowSimulatorGuidance>>;
    /** Keyed by the state it belongs to, by full key or short name. */
    steps?: Readonly<Record<string, DiscordFlowSimulatorStep>>;
    /** Only these elements can be pressed - the rest of a panel stays inert. */
    allowedElements?: ReadonlyArray<string>;
    /**
     * Ordinary messages sitting in the channel, drawn under the panel and above anything the bot
     * replies with - the things a feature acts on. A page that owns them can take them away when
     * the flow says they are gone.
     */
    channelMessages?: React.ReactNode;
    author?: string;
    avatar?: string;
    interactionUser?: string;
    interactionUserAvatar?: string;
}

interface SimulatorPosition extends DiscordFlowSimulatorPosition {
    /**
     * What the step that led here produced - what was typed, and what the transition wrote.
     *
     * Only this one arrival's worth. The bot builds a fresh bag of arguments for every reply it
     * sends, so carrying the last outcome's values into the next one would let something written
     * for an earlier answer stand in a later one, over the top of what that state declared for
     * itself. Anything true for longer than a single reply belongs to the channel, and reaches
     * every message through `entry.variables`.
     */
    variables: Readonly<Record<string, string>>;
    /** Which element brought somebody here, where one of several did. */
    triggeredBy?: string;
    /** Which copy of it, where the bot draws one per candidate. */
    triggeredByKey?: string;
}

/**
 * A feature, driven rather than described.
 *
 * The bot's own export says which element carries a person out of a state and which state it lands
 * them in, across flows as well as within one. So the buttons here are the bot's buttons, they lead
 * where the bot leads, and what somebody types comes back in the message the bot would have sent.
 * Nothing about the path is written down on the page - a button that stops existing stops being
 * offered, rather than being offered and going nowhere.
 *
 * Some states are more than something the bot said: a state that declares elements of its own is a
 * panel you go on working from, and it stays on screen with its menus live while the answers to
 * them come and go underneath - which is what the bot does when it refreshes a panel and replies
 * beside it.
 */
export function DiscordFlowSimulator( {
    entry,
    opensAt,
    guidance = {},
    steps = {},
    allowedElements,
    channelMessages,
    onGuidance,
    author = "VoiceChannels",
    avatar,
    interactionUser,
    interactionUserAvatar
}: DiscordFlowSimulatorProps ) {
    const onGuidanceRef = React.useRef( onGuidance );
    onGuidanceRef.current = onGuidance;

    const [ flows, setFlows ] = React.useState<ReadonlyMap<string, UIFlow> | null>( null );

    const [ position, setPosition ] = React.useState<SimulatorPosition>( {
        flowName: opensAt?.flowName ?? entry.flowName,
        stateKey: opensAt?.stateKey ?? entry.stateKey,
        variables: {}
    } );

    // The panel the flow opened, if it opened one that has to stay put.
    const [ desk, setDesk ] = React.useState<SimulatorPosition | null>( null );

    // The element whose modal is up, if one is.
    const [ openModal, setOpenModal ] = React.useState<{ elementId: string; origin: SimulatorPosition } | null>( null );

    // Its component, for the menus that carry their own options - privacy's three states are the
    // bot's to list, not a page's to retype.
    const [ deskComponent, setDeskComponent ] = React.useState<UIComponent | null>( null );

    React.useEffect( () => {
        let cancelled = false;

        const load = async() => {
            const loaded = new Map<string, UIFlow>();

            // Which of them have had their own edges followed, which is not the same as which
            // are on the list: a panel's flow names the claim's as somewhere it leads, and that
            // says nothing about where the claim itself leads once it is the message in hand.
            const walked = new Set<string>();

            /** A flow, and everywhere its own elements can carry somebody out of it. */
            const collect = async( flowName: string ) => {
                if ( walked.has( flowName ) ) {
                    return;
                }

                walked.add( flowName );

                const flow = loaded.get( flowName ) ?? await getUIFlowByName( flowName );

                if ( !flow ) {
                    return;
                }

                loaded.set( flow.name, flow );

                for ( const edge of flow.edgeSourceMappings ?? [] ) {
                    const target = await getUIFlowByName( edge.targetFlowName );

                    if ( target ) {
                        loaded.set( target.name, target );
                    }
                }
            };

            await collect( entry.flowName );

            // A flow already under way is not reached by any edge from the entry, so it has to be
            // asked for by name - along with wherever its own buttons lead, which is how a message
            // that arrived answers the person who pressed it.
            if ( opensAt ) {
                await collect( opensAt.flowName );
            }

            if ( cancelled ) {
                return;
            }

            // Added to rather than swapped in: a message the page takes away takes its flow off
            // the list of what to load, and whoever is still reading the answer it gave them would
            // be left standing in a flow nothing could read.
            setFlows( ( current ) => new Map( [ ...current ?? [], ...loaded ] ) );
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [ entry.flowName, opensAt?.flowName ] );

    React.useEffect( () => {
        const componentName = desk && flows
            ? flows.get( desk.flowName )?.states.find( ( item ) => item.key === desk.stateKey )?.options?.component
            : null;

        if ( !componentName ) {
            setDeskComponent( null );

            return;
        }

        let cancelled = false;

        void getUIComponentByName( componentName ).then( ( loaded ) => {
            if ( !cancelled ) {
                setDeskComponent( loaded );
            }
        } );

        return () => {
            cancelled = true;
        };
    }, [ flows, desk ] );

    React.useEffect( () => {
        setOpenModal( null );
    }, [ position.stateKey, position.flowName ] );

    const pageMessagesRef = React.useRef( {
        entry: { flowName: entry.flowName, stateKey: entry.stateKey },
        opened: opensAt ? { flowName: opensAt.flowName, stateKey: opensAt.stateKey } : null
    } );

    /**
     * Following the messages the page owns when they are rewritten, or taken away.
     *
     * A message in a channel is the same message for everybody, and the bot rewrites it as things
     * happen - a channel put up for grabs becomes a vote, and a claim called off is deleted
     * outright. Anybody still looking at what it used to say has to be moved to what it says now,
     * and anybody looking at one that is gone is left with the channel as it was. Anybody who has
     * gone on to an answer of their own stays where they are, because that answer is still theirs
     * and still on their screen.
     */
    React.useEffect( () => {
        const previous = pageMessagesRef.current;

        const now = {
            entry: { flowName: entry.flowName, stateKey: entry.stateKey },
            opened: opensAt ? { flowName: opensAt.flowName, stateKey: opensAt.stateKey } : null
        };

        pageMessagesRef.current = now;

        // Where somebody standing on each of them is moved to. A message that is gone leaves
        // whoever was on it looking at the channel, which is what deleting one does.
        const moves: Array<[ DiscordFlowSimulatorPosition, DiscordFlowSimulatorPosition ]> = [
            [ previous.entry, now.entry ]
        ];

        if ( previous.opened ) {
            moves.push( [ previous.opened, now.opened ?? now.entry ] );
        }

        for ( const [ from, to ] of moves ) {
            if ( from.flowName === to.flowName && from.stateKey === to.stateKey ) {
                continue;
            }

            setPosition( ( current ) =>
                current.flowName === from.flowName && current.stateKey === from.stateKey
                    ? { flowName: to.flowName, stateKey: to.stateKey, variables: {} }
                    : current );
        }
    }, [ entry.flowName, entry.stateKey, opensAt?.flowName, opensAt?.stateKey ] );

    const here = guidance[ position.stateKey ] ?? guidance[ stateShortName( position.stateKey ) ] ?? null;

    const hereRef = React.useRef( here );

    hereRef.current = here;

    /**
     * Telling the page which guidance applies now.
     *
     * A page writes its guidance inline, so every entry in it is a fresh object on each render and
     * there is nothing in one stable enough to compare - watching the entry itself would announce
     * it forever, and the page storing what it is told would keep the two of them going. What
     * actually decides which entry applies is where the reader is standing, so that is what this
     * watches, and the entry is read at the moment it is announced. A page whose wording depends on
     * its own state changes that state in `onTransition`, which is the same event that moves them.
     *
     * Every hook has to run before any of the early returns below can skip past them.
     */
    React.useEffect( () => {
        onGuidanceRef.current?.( hereRef.current );
    }, [ position.flowName, position.stateKey, undefined !== onGuidance ] );

    const findStep = React.useCallback(
        ( stateKey: string ) => steps[ stateKey ] ?? steps[ stateShortName( stateKey ) ],
        [ steps ]
    );

    /**
     * A state with nothing to fill in does not wait for anybody.
     *
     * Pressing "clear chat" is the whole of the interaction - the bot goes away, does it, and comes
     * back with what happened - so the flow is walked on as soon as it is reached, with whatever the
     * page says the bot would have found.
     */
    React.useEffect( () => {
        if ( !flows ) {
            return;
        }

        const current = flows.get( position.flowName );

        const pending = findStep( position.stateKey );

        /*
         * Only a step that says what the bot would have found here walks on by itself.
         *
         * That is what `values` is - the page standing in for a service, for a state nothing has to
         * be filled in for. A state with a modal to open, a menu to pick from or buttons to press is
         * waiting for somebody, and resolving it on arrival would both skip the interaction and,
         * since this runs on every render, keep re-asserting the state it landed in.
         */
        if ( !current || !pending?.values ) {
            return;
        }

        const values = pending.values( position.triggeredBy, position.triggeredByKey );

        const transition = resolveSubmittedTransition( current, position.stateKey, values );

        if ( !transition ) {
            return;
        }

        pending.onTransition?.( transition.name ?? null, values );

        setPosition( {
            flowName: current.name,
            stateKey: transition.to,
            variables: {
                ...pending.toVariables?.( values ),
                ...applyPreviewMutations( transition, values )
            }
        } );
    }, [ flows, position.flowName, position.stateKey, position.triggeredBy, position.triggeredByKey, findStep ] );

    if ( !flows ) {
        return <p className="text-h5">Loading…</p>;
    }

    const flow = flows.get( position.flowName );

    if ( !flow ) {
        return (
            <p className="text-h5">
                This is driven by the bot&apos;s own definitions, and they could not be read.
            </p>
        );
    }

    const stateOf = ( where: DiscordFlowSimulatorPosition ): UIFlowState | undefined =>
        flows.get( where.flowName )?.states.find( ( item ) => item.key === where.stateKey );

    const state = stateOf( position );

    const isEntry = position.stateKey === entry.stateKey && position.flowName === entry.flowName;

    // The panel stays on screen and its buttons keep working, exactly as they do in Discord once an
    // ephemeral reply has come and gone - so what can be pressed is always what the entry surface
    // offers, not what the state the flow has wandered into offers.
    const entryFlow = flows.get( entry.flowName );

    const choices = ( entryFlow ? resolveFlowChoices( entryFlow, entry.stateKey ) : [] ).filter(
        ( choice ) => !allowedElements || allowedElements.includes( choice.elementId )
    );

    const step = findStep( position.stateKey );

    const goTo = ( choice: UIFlowChoice, instanceKey?: string ) => {
        if ( !choice.targetState ) {
            return;
        }

        const arrived: SimulatorPosition = {
            flowName: choice.targetFlow,
            stateKey: choice.targetState,
            variables: {},
            triggeredBy: choice.elementId,
            triggeredByKey: instanceKey
        };

        // A state carrying elements of its own is a panel, and the person now works from it.
        setDesk( stateOf( arrived )?.options?.previewElementsGroup ? arrived : null );

        setPosition( arrived );
    };

    /** Walk the flow on from `from`, by whatever the element used and the answer given say. */
    const advance = (
        from: SimulatorPosition,
        values: Readonly<Record<string, string>>,
        elementId?: string
    ) => {
        const fromFlow = flows.get( from.flowName );

        // A state whose buttons only carry you somewhere else needs nothing declared for it: the
        // step is where a page says what to write down on the way, and plenty of states have
        // nothing to say.
        const fromStep = findStep( from.stateKey );

        if ( !fromFlow ) {
            return;
        }

        // The fork is the flow's own. Its transitions say, in the order the adapter declared them,
        // which one an answer like this takes - and what that transition writes down on the way.
        const transition = resolveSubmittedTransition( fromFlow, from.stateKey, values, elementId );

        if ( !transition ) {
            return;
        }

        fromStep?.onTransition?.( transition.name ?? null, values );

        // Walking on always closes the modal, whether or not the flow ends up somewhere new: a
        // transition that loops back to the state it left - a wizard step re-rendered with what
        // was just typed - still means the asking is over.
        setOpenModal( null );

        /*
         * A transition that takes its own reply away leaves the channel as it was.
         *
         * Nothing of the flow is on screen afterwards - not the panel it opened, not the answer it
         * gave - so the demonstration goes back to where somebody started, which is the message the
         * feature was reached from, carrying whatever the flow changed about it.
         */
        if ( transition.previewDeletesReply ) {
            setDesk( null );

            setPosition( { flowName: entry.flowName, stateKey: entry.stateKey, variables: {} } );

            return;
        }

        setPosition( {
            flowName: fromFlow.name,
            stateKey: transition.to,
            variables: {
                ...fromStep?.toVariables?.( values ),
                ...applyPreviewMutations( transition, values )
            },
            triggeredBy: elementId
        } );
    };

    const highlighted: Record<string, { highlighted: boolean }> = {};

    // Lit whenever pressing it would do something, which is whenever a modal is not already up.
    if ( !step?.render ) {
        for ( const choice of choices ) {
            highlighted[ choice.elementId ] = { highlighted: true };
        }

        // A demonstration that starts on an interactive message points at it the same way a step
        // on a panel does.
        for ( const elementName of ( isEntry ? findStep( entry.stateKey )?.highlight : undefined ) ?? [] ) {
            highlighted[ elementName ] = { highlighted: true };
        }
    }

    const onElementClick = ( elementName: string ) => {
        const choice = choices.find( ( item ) => item.elementId === elementName );

        if ( choice ) {
            goTo( choice );

            return;
        }

        // Not a way out of this flow, so it is a way on within it - the yes and no on a message
        // that arrived rather than one that was opened.
        onSurfaceElementClick( elementName );
    };

    /**
     * Where the menus are drawn, which moves with the answer where the answer carries them.
     *
     * An outcome that declares elements of its own is the panel now - the bot puts the result and
     * the menus in the one message, which is why those embeds say "use the menu below". An outcome
     * that declares none is only something said, and the panel it was said about stays put above it.
     */
    const positionCarriesElements = !isEntry && Boolean( state?.options?.previewElementsGroup );

    /**
     * A state the bot delivers by editing takes the place of what was on screen.
     *
     * `editReply` is the bot rewriting the message it already sent - the panel asking who to invite
     * becomes the one saying the invite went - so drawing the answer underneath would leave two
     * messages where Discord shows one, and the question still standing after it was answered.
     */
    const positionEditsSurface = !isEntry && "editReply" === state?.options?.navigationType;

    /**
     * Whether the flow is standing on the message that arrived rather than on one it opened.
     *
     * The bot rewrites that message where it lies - a channel put up for grabs becomes a vote, and
     * then the announcement of who won it - so it goes on being the one message it always was,
     * including once it has stopped offering anything to press. An ephemeral out of the same flow
     * is the exception, being a private answer to whoever pressed, and a second message.
     */
    const positionIsOpened = !isEntry && undefined !== opensAt
        && position.flowName === opensAt.flowName
        && "ephemeral" !== state?.options?.navigationType;

    /**
     * The arrived message, which stays on screen the way the message it landed under does.
     *
     * It is the channel's, so private answers come and go beneath it without taking it away, and
     * it is drawn at whatever the flow has since made of it rather than at what it first said.
     * Being the channel's is also why it never carries "only you can see this".
     */
    const opened: SimulatorPosition | null = opensAt
        ? ( positionIsOpened ? position : { flowName: opensAt.flowName, stateKey: opensAt.stateKey, variables: {} } )
        : null;

    const surface = opened ?? ( positionCarriesElements || positionEditsSurface ? position : desk );

    /**
     * Whether the message somebody started on is the one that has since been rewritten.
     *
     * A demonstration that starts on a panel keeps it: what the panel opens is a second message
     * beside it. One that starts on the message doing the asking - a request that arrived - has
     * only that message, so when the flow edits it there is nothing left to keep at the top.
     */
    const entryWasEdited = positionEditsSurface && position.flowName === entry.flowName;

    const surfaceState = surface ? stateOf( surface ) : undefined;

    const surfaceStep = surface ? findStep( surface.stateKey ) : undefined;

    /**
     * The ways out of the surface's own flow, for a message that leads somewhere else entirely.
     *
     * The panel's are read off the entry, because it is the panel whether or not the flow has
     * wandered. A message that arrived has its own, and they move with it: what a claim offers is
     * one thing while it is asking for takers and another once the voting is on.
     */
    const surfaceFlow = surface ? flows.get( surface.flowName ) : undefined;

    const surfaceChoices = ( surface && surfaceFlow ? resolveFlowChoices( surfaceFlow, surface.stateKey ) : [] )
        .filter( ( choice ) => !allowedElements || allowedElements.includes( choice.elementId ) );

    /**
     * The copies the surface's step asks for, under the names the bot would register them by.
     *
     * Declaring one is what splits the element into them: the renderer draws a button for every
     * name it finds under the element's own, which is how a row of vote buttons comes out of the
     * one button the component declares.
     */
    const surfaceInstances = new Map<string, DiscordFlowSimulatorElementInstance & { element: string }>();

    for ( const [ elementName, copies ] of Object.entries( surfaceStep?.elements ?? {} ) ) {
        for ( const copy of copies ) {
            surfaceInstances.set(
                `${ elementName }${ ELEMENT_INSTANCE_SEPARATOR }${ copy.key }`,
                { ...copy, element: elementName }
            );
        }
    }

    // What the surface is pointing at, where its step wants one thing pressed before the others.
    const surfaceHighlighted: Record<string, UIElementOverride> = {};

    for ( const [ name, copy ] of surfaceInstances ) {
        surfaceHighlighted[ name ] = { variables: copy.variables };
    }

    if ( !openModal ) {
        /** Lit on every copy of it, for an element the bot drew several of. */
        const light = ( elementName: string ) => {
            const copies = [ ...surfaceInstances ]
                .filter( ( [ , copy ] ) => copy.element === elementName )
                .map( ( [ name ] ) => name );

            for ( const name of copies.length ? copies : [ elementName ] ) {
                surfaceHighlighted[ name ] = { ...surfaceHighlighted[ name ], highlighted: true };
            }
        };

        for ( const choice of surfaceChoices ) {
            light( choice.elementId );
        }

        for ( const elementName of surfaceStep?.highlight ?? [] ) {
            light( elementName );
        }
    }

    const openModalRender = openModal
        ? findStep( openModal.origin.stateKey )?.modals?.[ openModal.elementId ]
        : undefined;

    /**
     * Which state's menus are on offer.
     *
     * A panel you are standing on offers its own - a list of templates to apply belongs to the step
     * that asks you to pick one. A panel drawn under an outcome that says nothing further offers
     * the ones it was opened with, because that is where their transitions all leave from.
     */
    const menuSource = surfaceStep?.menus ? surface : desk;

    const menuStep = menuSource ? findStep( menuSource.stateKey ) : undefined;

    const deskMenus = Object.entries( menuStep?.menus ?? {} ).map( ( [ elementName, menu ] ) => ( {
        elementName,
        // Left undefined, the renderer falls back to the menu's own declared options.
        options: menu.options?.map( ( option ) => ( {
            label: option.label,
            description: option.description,
            icon: option.icon
        } ) )
    } ) );

    /** The options the bot declared on one of its own menus, where it declared any. */
    const declaredOptionsOf = ( elementName: string ): ReadonlyArray<UISelectOptionDefinition> => {
        for ( const group of deskComponent?.elementsGroups ?? [] ) {
            for ( const row of group.items ) {
                for ( const item of row ) {
                    if ( item.element === elementName && isUISelectElementType( item.definition.elementType ) ) {
                        return ( item.definition as UISelectMenuDefinition ).selectOptions ?? [];
                    }
                }
            }
        }

        return [];
    };

    /**
     * Where a press of this element is answered from.
     *
     * A panel you are still standing on answers for itself - a wizard's Next leaves the step it is
     * drawn on. One drawn under an outcome that has nothing further to say answers from the panel
     * the outcome came out of, which is where its menus' transitions all leave from.
     */
    const originFor = ( elementId: string ): SimulatorPosition | null => {
        // The surface first, then the panel it came out of, and failing both wherever the flow
        // actually stands - which is the answer when a demonstration starts on the screen that
        // does the asking rather than on a panel that opens one.
        for ( const candidate of [ surface, desk, position ] ) {
            const flow = candidate ? flows.get( candidate.flowName ) : undefined;

            if ( candidate && flow && resolveSubmittedTransition( flow, candidate.stateKey, {}, elementId ) ) {
                return candidate;
            }
        }

        return null;
    };

    const onSurfaceElementClick = ( pressed: string ) => {
        // One of several copies of an element is still that element as far as the flow is
        // concerned; which copy it was is what it is for, and is carried along with it.
        const instance = surfaceInstances.get( pressed );

        const elementName = instance?.element ?? pressed;

        const choice = surfaceChoices.find( ( item ) => item.elementId === elementName );

        if ( choice ) {
            goTo( choice, instance?.key );

            return;
        }

        const origin = originFor( elementName );

        if ( !origin ) {
            return;
        }

        const originStep = findStep( origin.stateKey );

        if ( originStep?.modals?.[ elementName ] ) {
            setOpenModal( { elementId: elementName, origin } );

            return;
        }

        advance( origin, originStep?.buttons?.[ elementName ]?.() ?? {}, elementName );
    };

    const onSelectOption = ( elementName: string, optionIndex: number ) => {
        const menu = menuStep?.menus?.[ elementName ];

        if ( !menuSource || !menu ) {
            return;
        }

        if ( menu.options ) {
            const picked = menu.options[ optionIndex ];

            if ( !picked ) {
                return;
            }

            advance( menuSource, picked.values ?? {}, elementName );

            return;
        }

        const declared = declaredOptionsOf( elementName )[ optionIndex ];

        if ( !declared ) {
            return;
        }

        advance( menuSource, menu.valuesFromOption?.( declared ) ?? {}, elementName );
    };

    /**
     * Whether the flow is standing somewhere it is about to be walked on from by itself.
     *
     * A step saying what the bot would have found here is a state with nothing to ask anybody - the
     * fork a handler makes after a service answers it, which is passed through rather than shown.
     * Drawing it would put whatever its own declaration happens to say on screen for a moment, and
     * a claim answered with "you are in the running" would flash "you're back in charge" first.
     */
    const positionResolvesOnArrival = Boolean( step?.values );

    // What the bot replies with when it has something to say that the panel does not already carry.
    const reply = !isEntry && !positionCarriesElements && !positionEditsSurface && !positionIsOpened
        && !positionResolvesOnArrival
        && state?.options?.component && state.options.previewEmbedsGroup
        ? {
            component: state.options.component,
            embedsGroup: state.options.previewEmbedsGroup,
            // Only a reply the bot sends back to the presser carries "only you can see this"; one it
            // posts into the channel is there for the room.
            ephemeral: "silent" !== state.options.navigationType
        }
        : null;

    /**
     * The panel, as it is previewed above anything the bot says back about it.
     *
     * Both of the messages below answer a press on it, so both hang off it the way Discord hangs a
     * reply - and what shows of a panel is who it was addressed to, because it says nothing itself.
     * It is marked edited and carrying a picture because it is both: the bot rewrites it as the
     * channel changes, and the legend naming its buttons is an image inside it.
     */
    const answeringPanel: DiscordMessageReply = {
        author,
        avatar,
        app: true,
        edited: true,
        hasAttachment: true,
        preview: entry.mentionUser
            ? <span className="discord-mention-pill">@{ entry.mentionUser }</span>
            : undefined
    };

    return (
        <>
            { /*
               * The channel, which stays where it is. Discord does not take the message away to
               * show a modal - it dims it and floats the modal over the top - and the reply lands
               * underneath the message that was pressed, not in place of it.
               */ }
            <div className="discord-chat-container vc-frame-box relative m-0 mb-4">
                { !entryWasEdited && <DiscordUIComponentMessage
                    author={ author }
                    avatar={ avatar }
                    componentName={ entry.componentName }
                    mentionUsername={ entry.mentionUser }
                    variables={ { ...entry.variables, ...position.variables } }
                    elementOverrides={ highlighted }
                    onElementClick={ onElementClick }
                    interactionUser={ interactionUser }
                    interactionUserAvatar={ interactionUserAvatar }
                /> }

                { channelMessages }

                { /*
                   * A state with no embeds group of its own is not a message the bot shows - it is
                   * somewhere the flow passes through on its way. Drawing it would invent a screen,
                   * and fill it with whichever group the component happens to call default.
                   */ }
                { surface && surfaceState?.options?.component && surfaceState.options.previewEmbedsGroup && (
                    <DiscordUIComponentMessage
                        author={ author }
                        avatar={ avatar }
                        componentName={ surfaceState.options.component }
                        preferredEmbedsGroup={ surfaceState.options.previewEmbedsGroup ?? undefined }
                        preferredElementsGroup={ surfaceState.options.previewElementsGroup ?? undefined }
                        // A state that declares no elements shows none, rather than falling back to
                        // whichever group its component happens to call default.
                        hideElements={ !surfaceState.options.previewElementsGroup }
                        variables={ { ...entry.variables, ...surface.variables } }
                        defaultVariables={ surfaceState.options.previewDefaultVars }
                        ephemeral={ null === opened && "silent" !== surfaceState.options.navigationType }
                        reply={ "silent" !== surfaceState.options.navigationType ? answeringPanel : undefined }
                        interactionUser={ interactionUser }
                        interactionUserAvatar={ interactionUserAvatar }
                        expandedSelectMenu={ deskMenus }
                        onSelectOption={ deskMenus.length ? onSelectOption : undefined }
                        elementOverrides={ surfaceHighlighted }
                        onElementClick={ onSurfaceElementClick }
                    />
                ) }

                { reply && (
                    <DiscordUIComponentMessage
                        author={ author }
                        avatar={ avatar }
                        componentName={ reply.component }
                        preferredEmbedsGroup={ reply.embedsGroup }
                        hideElements={ true }
                        variables={ { ...entry.variables, ...position.variables } }
                        defaultVariables={ state?.options?.previewDefaultVars }
                        ephemeral={ reply.ephemeral }
                        reply={ reply.ephemeral ? answeringPanel : undefined }
                        interactionUser={ interactionUser }
                        interactionUserAvatar={ interactionUserAvatar }
                    />
                ) }

                { step?.render && (
                    <div className="discord-modal-overlay">
                        <div className="discord-modal-overlay-backdrop"/>
                        { step.render(
                            ( values ) => advance( position, values ),
                            state?.options?.previewDefaultVars ?? {}
                        ) }
                    </div>
                ) }

                { openModalRender && openModal && (
                    <div className="discord-modal-overlay">
                        <div className="discord-modal-overlay-backdrop"/>
                        { openModalRender( ( values ) => advance( openModal.origin, values, openModal.elementId ) ) }
                    </div>
                ) }
            </div>
        </>
    );
}
