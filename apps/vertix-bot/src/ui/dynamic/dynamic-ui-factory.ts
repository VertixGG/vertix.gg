import { ChannelType, MessageFlags } from "discord.js";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";
import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { UIDefinitionLoader } from "@vertix.gg/gui/src/runtime/ui-definition-loader";
import { interactionHandlerRegistry } from "@vertix.gg/gui/src/runtime/interaction-handler-registry";
import { uiClassRegistry } from "@vertix.gg/gui/src/runtime/ui-class-registry";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { APISelectMenuOption, APIEmbedThumbnail } from "discord.js";

import type {
    AdapterDefinition,
    ComponentDefinition,
    ElementReference
} from "@vertix.gg/gui/src/runtime/ui-definition-types";
import type { RegisterableClass } from "@vertix.gg/gui/src/runtime/ui-class-registry";
import type { TAdapterClassType } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type {
    DynamicUIButtonSpec,
    DynamicUIInteraction,
    DynamicUISelectSpec,
    DynamicUISpec
} from "@vertix.gg/definitions/src/ui-ipc-definitions";

const DYNAMIC_MODULE_NAME = "VertixBot/UI-Dynamic/Module";
const DYNAMIC_NAME_PREFIX = "VertixBot/UI-Dynamic";
const DEFAULT_EMBED_COLOR = 0x33cdd5;
const DEFAULT_BUTTON_STYLE: UIButtonStyleTypes = "primary";
const DEFAULT_CHANNEL_TYPES: ChannelType[] = [ ChannelType.GuildText, ChannelType.GuildVoice ];
// Permissions the clicking member must hold - none by default, so anyone in the channel can use
// the UI. `null` is not an option: the base adapter throws when nothing is declared.
const DEFAULT_REQUIRED_PERMISSIONS = "0";

const MAX_NAME_LENGTH = 32;
const MAX_BUTTONS = 20;
const MAX_BUTTONS_PER_ROW = 5;
const MAX_SELECT_OPTIONS = 25;
const MAX_LABEL_LENGTH = 80;
const MAX_INTERACTIONS = 200;
// Interaction tokens are good for 15 minutes - stop reusing one a little before that.
const EPHEMERAL_STATUS_TTL = 14 * 60 * 1000;
const MAX_EPHEMERAL_STATUSES = 200;

const NAME_PATTERN = /^[a-z0-9][a-z0-9-_]*$/;

/**
 * Hashed custom ids, like every other module - the plain strategy would spell out both the
 * adapter and the element name, which overflows Discord's 100 character custom id limit.
 */
class DynamicUIModule extends UIModuleBase {
    public static override getName() {
        return DYNAMIC_MODULE_NAME;
    }

    public static override getAdapters() {
        return [];
    }

    protected override getCustomIdStrategy() {
        return new UICustomIdHashStrategy();
    }
}

let dynamicModule: DynamicUIModule | null = null;

function getDynamicModule() {
    if ( ! dynamicModule ) {
        dynamicModule = new DynamicUIModule();
    }

    return dynamicModule;
}

const specs = new Map<string, DynamicUISpec>();
const interactions: DynamicUIInteraction[] = [];

type MinimalInteraction = {
    user?: { id: string; username: string };
    channelId?: string;
    guildId?: string | null;
    message?: { id: string };
    values?: string[];
    reply?: ( options: { content: string; flags: number } ) => Promise<unknown>;
    editReply?: ( options: { content: string } ) => Promise<unknown>;
    followUp?: ( options: { content: string; flags: number } ) => Promise<{ id: string }>;
    webhook?: { editMessage: ( messageId: string, options: { content: string } ) => Promise<unknown> };
    deferUpdate?: () => Promise<unknown>;
};

export type DynamicInteractionOrigin = {
    channelId?: string;
    guildId?: string | null;
};

export type DynamicInteractionListener = (
    interaction: DynamicUIInteraction,
    origin: DynamicInteractionOrigin
) => void;

let interactionListener: DynamicInteractionListener | null = null;

/**
 * Without a listener a click is only recorded, and the buttons do nothing until someone polls
 * ui_get_interactions. The listener is what hands the click back to the agent.
 */
export function setDynamicInteractionListener( listener: DynamicInteractionListener | null ) {
    interactionListener = listener;
}

function getAdapterName( name: string ) {
    return `${ DYNAMIC_NAME_PREFIX }/${ name }Adapter`;
}

function getComponentName( name: string ) {
    return `${ DYNAMIC_NAME_PREFIX }/${ name }Component`;
}

function getEmbedName( name: string ) {
    return `${ DYNAMIC_NAME_PREFIX }/${ name }Embed`;
}

function getElementName( name: string, elementId: string ) {
    return `${ DYNAMIC_NAME_PREFIX }/${ name }/${ elementId }`;
}

function getHandlerName( name: string, elementId: string ) {
    return `${ DYNAMIC_NAME_PREFIX }/${ name }/Handlers/${ elementId }`;
}

function assert( condition: unknown, message: string ): asserts condition {
    if ( ! condition ) {
        throw new Error( message );
    }
}

export function validateDynamicUISpec( spec: DynamicUISpec ) {
    assert( typeof spec?.name === "string" && NAME_PATTERN.test( spec.name ), "'name' must match [a-z0-9][a-z0-9-_]*" );
    assert( spec.name.length <= MAX_NAME_LENGTH, `'name' must be at most ${ MAX_NAME_LENGTH } characters` );
    assert( spec.title || spec.description, "at least one of 'title' or 'description' is required" );

    const buttons = spec.buttons ?? [];

    assert( buttons.length <= MAX_BUTTONS, `at most ${ MAX_BUTTONS } buttons are allowed` );

    const elementIds = new Set<string>();

    for ( const button of buttons ) {
        assert( NAME_PATTERN.test( button.id ), `button id '${ button.id }' must match [a-z0-9][a-z0-9-_]*` );
        assert( ! elementIds.has( button.id ), `duplicated element id '${ button.id }'` );
        assert( button.label && button.label.length <= MAX_LABEL_LENGTH, `button '${ button.id }' needs a label of at most ${ MAX_LABEL_LENGTH } characters` );

        elementIds.add( button.id );
    }

    if ( spec.select ) {
        assert( NAME_PATTERN.test( spec.select.id ), `select id '${ spec.select.id }' must match [a-z0-9][a-z0-9-_]*` );
        assert( ! elementIds.has( spec.select.id ), `duplicated element id '${ spec.select.id }'` );
        assert( spec.select.options?.length, "select menu needs at least one option" );
        assert( spec.select.options.length <= MAX_SELECT_OPTIONS, `select menu allows at most ${ MAX_SELECT_OPTIONS } options` );

        for ( const option of spec.select.options ) {
            assert( option.label && option.value, "every select option needs a 'label' and a 'value'" );
        }
    }

    if ( spec.requiredPermissions !== undefined ) {
        assert(
            /^\d+$/.test( spec.requiredPermissions ),
            "'requiredPermissions' must be a decimal permissions bitfield, as a string"
        );
    }
}

/**
 * The adapters built from code return numeric channel types; the definition is typed as strings,
 * so the names coming from the spec are resolved here instead of relying on runtime normalization.
 */
function resolveChannelTypes( values?: string[] ): ChannelType[] {
    if ( ! values?.length ) {
        return DEFAULT_CHANNEL_TYPES;
    }

    return values.map( ( value ) => {
        const mapped = ( ChannelType as unknown as Record<string, ChannelType> )[ value ];

        assert( typeof mapped === "number", `unknown channel type '${ value }'` );

        return mapped;
    } );
}

function createEmbedClass( spec: DynamicUISpec ) {
    const embedName = getEmbedName( spec.name );

    return class DynamicEmbed extends UIEmbedBase {
        public static override getName() {
            return embedName;
        }

        public static override getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected override getTitle(): string {
            return specs.get( spec.name )?.title ?? "";
        }

        protected override getDescription(): string {
            return specs.get( spec.name )?.description ?? "";
        }

        protected override getColor() {
            return specs.get( spec.name )?.color ?? DEFAULT_EMBED_COLOR;
        }

        protected override getImage(): string {
            return specs.get( spec.name )?.image ?? "";
        }

        protected override getThumbnail(): APIEmbedThumbnail | null {
            const thumbnail = specs.get( spec.name )?.thumbnail;

            return thumbnail ? { url: thumbnail } : null;
        }

        protected override getFooter(): string {
            return specs.get( spec.name )?.footer ?? "";
        }
    } as unknown as RegisterableClass<object>;
}

function createButtonClass( spec: DynamicUISpec, button: DynamicUIButtonSpec ) {
    const elementName = getElementName( spec.name, button.id );
    const findButton = () => specs.get( spec.name )?.buttons?.find( ( item ) => item.id === button.id ) ?? button;

    return class DynamicButton extends UIElementButtonBase {
        public static override getName() {
            return elementName;
        }

        public static override getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected override async getLabel() {
            return findButton().label;
        }

        protected override async getStyle(): Promise<UIButtonStyleTypes> {
            return findButton().style ?? DEFAULT_BUTTON_STYLE;
        }

        protected override async getEmoji() {
            return findButton().emoji ?? "";
        }
    } as unknown as RegisterableClass<object>;
}

function createSelectClass( spec: DynamicUISpec, select: DynamicUISelectSpec ) {
    const elementName = getElementName( spec.name, select.id );
    const findSelect = () => specs.get( spec.name )?.select ?? select;

    return class DynamicSelectMenu extends UIElementStringSelectMenu {
        public static override getName() {
            return elementName;
        }

        public static override getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        protected override async getSelectOptions(): Promise<APISelectMenuOption[]> {
            return findSelect().options.map( ( option ) => ( {
                label: option.label,
                value: option.value,
                description: option.description,
                emoji: option.emoji ? { name: option.emoji } : undefined
            } ) );
        }

        protected override async getPlaceholder() {
            return findSelect().placeholder ?? "";
        }

        protected override async getMinValues() {
            return findSelect().minValues;
        }

        protected override async getMaxValues() {
            return findSelect().maxValues;
        }
    } as unknown as RegisterableClass<object>;
}

function recordInteraction( interaction: DynamicUIInteraction ) {
    interactions.push( interaction );

    if ( interactions.length > MAX_INTERACTIONS ) {
        interactions.splice( 0, interactions.length - MAX_INTERACTIONS );
    }
}

type EphemeralStatus = {
    at: number;
    edit: ( content: string ) => Promise<unknown>;
};

/**
 * The ephemeral status line of a user in a channel. Every click says what it is doing, and without
 * this each one would stack another ephemeral message instead of updating the line the user is
 * already looking at.
 */
const ephemeralStatuses = new Map<string, EphemeralStatus>();

function getStatusKey( interaction: MinimalInteraction ) {
    return `${ interaction?.channelId ?? "unknown" }:${ interaction?.user?.id ?? "unknown" }`;
}

function rememberStatus( key: string, status: EphemeralStatus ) {
    ephemeralStatuses.set( key, status );

    if ( ephemeralStatuses.size <= MAX_EPHEMERAL_STATUSES ) {
        return;
    }

    // Nothing removes the entries of users who stopped clicking - drop what can no longer be
    // edited anyway.
    for ( const [ entryKey, entry ] of ephemeralStatuses ) {
        if ( Date.now() - entry.at >= EPHEMERAL_STATUS_TTL ) {
            ephemeralStatuses.delete( entryKey );
        }
    }
}

function forgetEphemeralStatuses( channelId: string ) {
    const prefix = `${ channelId }:`;

    for ( const key of ephemeralStatuses.keys() ) {
        if ( key.startsWith( prefix ) ) {
            ephemeralStatuses.delete( key );
        }
    }
}

function takeFreshStatus( key: string ): EphemeralStatus | null {
    const status = ephemeralStatuses.get( key );

    if ( ! status ) {
        return null;
    }

    // The token that lets us edit it expires with the interaction that created it.
    if ( Date.now() - status.at >= EPHEMERAL_STATUS_TTL ) {
        ephemeralStatuses.delete( key );

        return null;
    }

    return status;
}

/**
 * Answers the click on the ephemeral line the user already has, and only posts a new one when
 * there is nothing to reuse - a first click, an expired token, or a message the user dismissed.
 */
async function replyEphemeralStatus( interaction: MinimalInteraction, content: string ) {
    const key = getStatusKey( interaction );
    const status = takeFreshStatus( key );

    if ( status ) {
        // Acknowledge the click first - the panel stays as it is, and Discord gets its answer
        // within the three seconds it allows.
        await interaction.deferUpdate?.();

        try {
            await status.edit( content );

            return;
        } catch( error ) {
            GlobalLogger.$.warn(
                replyEphemeralStatus,
                `Could not update the ephemeral status of '${ key }', posting a new one`,
                error
            );

            ephemeralStatuses.delete( key );
        }

        const followUp = await interaction.followUp?.( { content, flags: MessageFlags.Ephemeral } );
        const webhook = interaction.webhook;

        if ( followUp && webhook ) {
            rememberStatus( key, {
                at: Date.now(),
                edit: ( next ) => webhook.editMessage( followUp.id, { content: next } )
            } );
        }

        return;
    }

    await interaction.reply?.( { content, flags: MessageFlags.Ephemeral } );

    if ( interaction.editReply ) {
        rememberStatus( key, {
            at: Date.now(),
            edit: ( next ) => interaction.editReply!( { content: next } )
        } );
    }
}

/**
 * One handler per element, registered once and kept stable across re-creations - the registry
 * refuses to re-register a name, and the reply text is read from the current spec anyway.
 */
function ensureHandler( specName: string, elementId: string, elementType: DynamicUIInteraction[ "elementType" ] ) {
    const handlerName = getHandlerName( specName, elementId );

    if ( interactionHandlerRegistry.has( handlerName ) ) {
        return handlerName;
    }

    interactionHandlerRegistry.register( handlerName, async( ...args: unknown[] ) => {
        const interaction = args[ 1 ] as MinimalInteraction;
        const values = interaction?.values;

        const record: DynamicUIInteraction = {
            adapterName: getAdapterName( specName ),
            specName,
            elementId,
            elementType,
            userId: interaction?.user?.id ?? "unknown",
            username: interaction?.user?.username ?? "unknown",
            values,
            at: Date.now()
        };

        recordInteraction( record );

        // Whatever the agent answers with lands in the panel that was clicked.
        if ( interaction?.channelId && interaction?.message?.id ) {
            adoptChannelPanel( interaction.channelId, getAdapterName( specName ), interaction.message.id );
        }

        const notify = () => interactionListener?.( record, {
            channelId: interaction?.channelId,
            guildId: interaction?.guildId
        } );

        const spec = specs.get( specName );
        const reply = elementType === "button"
            ? spec?.buttons?.find( ( button ) => button.id === elementId )?.reply
            : spec?.select?.reply;

        if ( reply && interaction?.reply ) {
            const content = reply
                .replaceAll( "{user}", `<@${ interaction.user?.id ?? "" }>` )
                .replaceAll( "{values}", ( values ?? [] ).join( ", " ) );

            await replyEphemeralStatus( interaction, content );

            notify();

            return;
        }

        // Discord marks the interaction as failed unless it is acknowledged.
        await interaction?.deferUpdate?.();

        notify();
    } );

    return handlerName;
}

function buildDefinitions( spec: DynamicUISpec ) {
    const adapterName = getAdapterName( spec.name );
    const componentName = getComponentName( spec.name );
    const elementsGroupName = `${ componentName }/ElementsGroup`;
    const embedsGroupName = `${ componentName }/EmbedsGroup`;

    const rows: ElementReference[][] = [];
    const bindings: AdapterDefinition[ "bindings" ] = [];

    const buttons = spec.buttons ?? [];

    for ( let index = 0; index < buttons.length; index += MAX_BUTTONS_PER_ROW ) {
        rows.push( buttons.slice( index, index + MAX_BUTTONS_PER_ROW ).map( ( button ) => ( {
            element: getElementName( spec.name, button.id )
        } ) ) );
    }

    for ( const button of buttons ) {
        bindings.push( {
            entity: getElementName( spec.name, button.id ),
            handler: ensureHandler( spec.name, button.id, "button" ),
            kind: "button"
        } );
    }

    if ( spec.select ) {
        rows.push( [ { element: getElementName( spec.name, spec.select.id ) } ] );

        bindings.push( {
            entity: getElementName( spec.name, spec.select.id ),
            handler: ensureHandler( spec.name, spec.select.id, "select" ),
            kind: "string-select"
        } );
    }

    // A UI with nothing to click is legitimate - a result panel, a status readout.
    const hasElements = rows.length > 0;

    const componentDefinition: ComponentDefinition = {
        name: componentName,
        type: "component",
        instanceType: "Dynamic",
        modules: [ DYNAMIC_MODULE_NAME ],
        elementsGroups: hasElements ? [ { name: elementsGroupName, items: rows } ] : [],
        embedsGroups: [ { name: embedsGroupName, items: [ { embed: getEmbedName( spec.name ) } ] } ],
        modals: [],
        defaultElementsGroup: hasElements ? elementsGroupName : null,
        defaultEmbedsGroup: embedsGroupName,
        defaultMarkdownsGroup: null,
        hooks: []
    };

    const adapterDefinition: AdapterDefinition = {
        name: adapterName,
        adapterKind: "execution",
        component: componentName,
        module: DYNAMIC_MODULE_NAME,
        // Static execution adapters refuse to `send()` without an interaction context, and a UI
        // posted by the AI always starts from a channel.
        instanceType: "Dynamic",
        channelTypes: resolveChannelTypes( spec.channelTypes ) as unknown as string[],
        permissions: spec.requiredPermissions ?? DEFAULT_REQUIRED_PERMISSIONS,
        executionSteps: [ {
            key: "default",
            elementsGroup: hasElements ? elementsGroupName : null,
            embedsGroup: embedsGroupName,
            markdownGroup: null,
            hooks: []
        } ],
        bindings,
        hooks: []
    };

    return { adapterName, componentName, componentDefinition, adapterDefinition };
}

/**
 * Registers the element/embed classes and the adapter itself, so a JSON spec becomes a real
 * adapter the bot can send and keep handling interactions for.
 */
export async function createDynamicAdapter( uiService: UIService, spec: DynamicUISpec ) {
    validateDynamicUISpec( spec );

    specs.set( spec.name, spec );

    uiClassRegistry.register( createEmbedClass( spec ) );

    for ( const button of spec.buttons ?? [] ) {
        uiClassRegistry.register( createButtonClass( spec, button ) );
    }

    if ( spec.select ) {
        uiClassRegistry.register( createSelectClass( spec, spec.select ) );
    }

    const { adapterName, componentName, componentDefinition, adapterDefinition } = buildDefinitions( spec );

    const loader = new UIDefinitionLoader( {
        mode: "mongo",
        componentsCollection: {
            findOne: async( filter ) => filter.name === componentName ? componentDefinition : null
        },
        adaptersCollection: {
            findOne: async( filter ) => filter.name === adapterName ? adapterDefinition : null
        },
        flowsCollection: {
            findOne: async() => null
        }
    } );

    const hydrated = await loader.loadAdapter( adapterName );

    assert( hydrated.adapterClass, `adapter '${ adapterName }' did not produce a runtime class` );

    const replaced = uiService.unregisterAdapter( adapterName );

    uiService.registerAdapter( hydrated.adapterClass as TAdapterClassType, { module: getDynamicModule() } );

    GlobalLogger.$.log(
        createDynamicAdapter,
        `${ replaced ? "Replaced" : "Created" } dynamic adapter '${ adapterName }'`
    );

    return { adapterName, replaced };
}

export function deleteDynamicAdapter( uiService: UIService, name: string ) {
    const adapterName = getAdapterName( name );
    const deleted = uiService.unregisterAdapter( adapterName );

    specs.delete( name );

    return { adapterName, deleted };
}

type PanelMessage = {
    channelId: string;
    messageId: string;
    adapterName: string;
};

/**
 * One panel per channel, keyed by the channel rather than by the UI name: the agent picks a new
 * name whenever it moves to a different screen, and every screen should still land in the same
 * message the user is already looking at.
 */
const panelsByChannel = new Map<string, PanelMessage>();
const retiringPanels = new Map<string, PanelMessage>();
const panelRevisions = new Map<string, number>();

export function isDynamicAdapter( adapterName: string ) {
    return adapterName.startsWith( `${ DYNAMIC_NAME_PREFIX }/` );
}

export function peekChannelPanel( channelId: string ): PanelMessage | null {
    return panelsByChannel.get( channelId ) ?? null;
}

export function recordChannelPanel( channelId: string, adapterName: string, messageId: string ) {
    panelsByChannel.set( channelId, { channelId, adapterName, messageId } );
    panelRevisions.set( channelId, ( panelRevisions.get( channelId ) ?? 0 ) + 1 );

    for ( const listener of panelRenderListeners ) {
        listener( channelId );
    }
}

export type PanelRenderListener = ( channelId: string ) => void;

const panelRenderListeners = new Set<PanelRenderListener>();

/**
 * Fires as soon as a panel is on screen, posted or updated. What the agent does after that is no
 * longer something the user is waiting for. Returns the unsubscribe.
 */
export function onPanelRendered( listener: PanelRenderListener ) {
    panelRenderListeners.add( listener );

    return () => {
        panelRenderListeners.delete( listener );
    };
}

export function forgetChannelPanel( channelId: string ) {
    panelsByChannel.delete( channelId );
}

/**
 * Takes the message a click came from as the channel's panel, so the answer to that click is drawn
 * where the user clicked - also when a message from the user in the meantime started a new panel.
 * It is not a panel update in itself: nothing was posted yet, so the revision stays as it is.
 */
export function adoptChannelPanel( channelId: string, adapterName: string, messageId: string ) {
    const retiring = retiringPanels.get( channelId );

    // It is being used, not left behind.
    if ( retiring?.messageId === messageId ) {
        retiringPanels.delete( channelId );
    }

    panelsByChannel.set( channelId, { channelId, adapterName, messageId } );
}

/**
 * Stops reusing the channel's panel, so the next post creates a fresh message. The old one is
 * queued for retirement - it keeps what it said, but loses controls that would compete with the
 * new panel. The status lines go with it: they belong to the panel that is being left behind.
 */
export function startNewPanel( channelId: string ) {
    const panel = panelsByChannel.get( channelId );

    panelsByChannel.delete( channelId );

    if ( panel ) {
        retiringPanels.set( channelId, panel );
    }

    forgetEphemeralStatuses( channelId );
}

export function takeRetiringPanel( channelId: string ): PanelMessage | null {
    const panel = retiringPanels.get( channelId ) ?? null;

    retiringPanels.delete( channelId );

    return panel;
}

/**
 * Bumped every time the channel's panel is posted or updated, so a caller can tell whether a turn
 * already answered through the UI.
 */
export function getPanelRevision( channelId: string ): number {
    return panelRevisions.get( channelId ) ?? 0;
}

export function listDynamicAdapters() {
    return Array.from( specs.entries() ).map( ( [ name, spec ] ) => ( {
        specName: name,
        adapterName: getAdapterName( name ),
        title: spec.title,
        buttons: ( spec.buttons ?? [] ).map( ( button ) => button.id ),
        select: spec.select?.id ?? null
    } ) );
}

export function getDynamicInteractions( options: { specName?: string; since?: number; limit?: number } = {} ) {
    const { specName, since = 0, limit = 50 } = options;

    const filtered = interactions.filter( ( interaction ) =>
        interaction.at > since && ( ! specName || interaction.specName === specName )
    );

    return filtered.slice( - limit );
}
